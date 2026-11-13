import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ==========================================
// PERSISTENCIA Y SINCRONIZACIÓN DE HOGARES (PAREJA) + DEDUPLICACIÓN DE TICKETS
// ==========================================
interface HouseholdData {
  code: string;
  tunnelKeyHash?: string;
  shoppingItems: any[];
  pantryItems: any[];
  registeredReceiptHashes: string[];
  updatedAt: number;
  lastUpdatedBy?: string;
}

const BLOCKED_LEGACY_CODES = new Set(['HOGAR-PAREJA', 'DEFAULT', 'TEST', 'DEMO', 'PUBLIC']);

const hashTunnelKey = (key: string): string =>
  crypto.createHash('sha256').update(String(key || '').trim()).digest('hex');

const extractTunnelKey = (req: express.Request): string => {
  const headerKey = req.headers['x-tunnel-key'];
  const queryKey = req.query.key;
  if (typeof headerKey === 'string' && headerKey.trim()) return headerKey.trim();
  if (typeof queryKey === 'string' && queryKey.trim()) return queryKey.trim();
  return '';
};

const verifyTunnelKey = (incomingKey: string, storedHash?: string): boolean => {
  if (!storedHash) return false;
  if (!incomingKey || incomingKey.length < 8) return false;
  const incomingHash = hashTunnelKey(incomingKey);
  const a = Buffer.from(incomingHash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const sanitizeHouseholdForClient = (data: HouseholdData) => {
  const { tunnelKeyHash: _omit, ...rest } = data;
  return rest;
};

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'households.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const households = new Map<string, HouseholdData>();

// Cargar hogares guardados en disco al iniciar
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, HouseholdData>;
    Object.entries(parsed).forEach(([k, v]) => {
      households.set(k, {
        ...v,
        registeredReceiptHashes: Array.isArray(v.registeredReceiptHashes)
          ? v.registeredReceiptHashes
          : [],
      });
    });
    console.log(`🏠 ${households.size} hogar(es) compartido(s) cargados de disco.`);
  }
} catch (err) {
  console.error('Error cargando households.json:', err);
}

const saveHouseholdsToDisk = () => {
  try {
    const obj: Record<string, HouseholdData> = {};
    households.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error guardando households.json:', err);
  }
};

// Clientes SSE conectados por código de hogar
interface SSEClient {
  id: string;
  res: express.Response;
  userName?: string;
}
const sseClients = new Map<string, Set<SSEClient>>();

const normalizeCode = (raw: string) =>
  raw.trim().toUpperCase().replace(/[^A-Z0-9-_]/g, '').slice(0, 24);

const broadcastToHousehold = (code: string, payload: any, excludeClientId?: string) => {
  const clients = sseClients.get(code);
  if (!clients) return;
  const message = `data: ${JSON.stringify({
    ...payload,
    connectedDevices: clients.size,
  })}\n\n`;

  clients.forEach((client) => {
    if (excludeClientId && client.id === excludeClientId) return;
    try {
      client.res.write(message);
    } catch {
      clients.delete(client);
    }
  });
};

const broadcastPresence = (code: string) => {
  const clients = sseClients.get(code);
  const count = clients ? clients.size : 0;
  const members = clients
    ? Array.from(clients)
        .map((c) => c.userName)
        .filter(Boolean)
    : [];

  if (!clients) return;
  const message = `data: ${JSON.stringify({
    type: 'presence',
    connectedDevices: count,
    members,
  })}\n\n`;

  clients.forEach((client) => {
    try {
      client.res.write(message);
    } catch {
      clients.delete(client);
    }
  });
};

// Obtener estado actual de un hogar compartido (requiere clave de túnel privada)
app.get('/api/household/:code', (req, res) => {
  const code = normalizeCode(req.params.code);
  if (!code || BLOCKED_LEGACY_CODES.has(code)) {
    return res.status(403).json({
      error: 'Código de hogar no permitido o deshabilitado por seguridad. Genera un túnel privado.',
    });
  }

  const incomingKey = extractTunnelKey(req);
  if (!incomingKey || incomingKey.length < 8) {
    return res.status(401).json({ error: 'Se requiere clave de túnel privada (tunnelKey).' });
  }

  const existing = households.get(code);
  const clients = sseClients.get(code);

  if (!existing) {
    return res.json({
      exists: false,
      code,
      registeredReceiptHashes: [],
      connectedDevices: clients ? clients.size : 0,
    });
  }

  if (!verifyTunnelKey(incomingKey, existing.tunnelKeyHash)) {
    return res.status(403).json({
      error: 'Clave de túnel privada inválida. Acceso denegado.',
    });
  }

  return res.json({
    exists: true,
    ...sanitizeHouseholdForClient(existing),
    registeredReceiptHashes: existing.registeredReceiptHashes || [],
    connectedDevices: clients ? clients.size : 0,
  });
});

// Verificar si un hash SHA-256 de ticket ya fue registrado en el hogar compartido
app.get('/api/household/:code/receipt-hash/:hash', (req, res) => {
  const code = normalizeCode(req.params.code);
  if (!code || BLOCKED_LEGACY_CODES.has(code)) {
    return res.status(403).json({ error: 'Código de hogar no permitido.' });
  }

  const incomingKey = extractTunnelKey(req);
  const existing = households.get(code);
  if (existing && !verifyTunnelKey(incomingKey, existing.tunnelKeyHash)) {
    return res.status(403).json({ error: 'Acceso denegado al túnel privado.' });
  }

  const hash = String(req.params.hash || '').trim().toLowerCase();
  const isDuplicate = Boolean(
    existing &&
      Array.isArray(existing.registeredReceiptHashes) &&
      existing.registeredReceiptHashes.includes(hash)
  );
  return res.json({
    code,
    hash,
    isDuplicate,
  });
});

// Actualizar estado de un hogar compartido (protegido por clave de túnel privada)
app.put('/api/household/:code', (req, res) => {
  const code = normalizeCode(req.params.code);
  if (!code || BLOCKED_LEGACY_CODES.has(code)) {
    return res.status(403).json({
      error: 'Código de hogar público deshabilitado. Usa un túnel privado.',
    });
  }

  const incomingKey = extractTunnelKey(req);
  if (!incomingKey || incomingKey.length < 8) {
    return res.status(401).json({
      error: 'Falta la clave de túnel privada.',
    });
  }

  const {
    shoppingItems,
    pantryItems,
    registeredReceiptHashes,
    lastUpdatedBy,
    clientId,
  } = req.body;

  if (!Array.isArray(shoppingItems) || !Array.isArray(pantryItems)) {
    return res.status(400).json({ error: 'Datos de lista o despensa inválidos' });
  }

  const prev = households.get(code);

  // Si el hogar ya existe, validar que el cliente tenga la clave privada exacta
  if (prev && !verifyTunnelKey(incomingKey, prev.tunnelKeyHash)) {
    return res.status(403).json({
      error: 'Clave de túnel privada inválida. No tienes permiso para modificar este hogar.',
    });
  }

  const mergedHashes = Array.from(
    new Set([
      ...(prev?.registeredReceiptHashes || []),
      ...(Array.isArray(registeredReceiptHashes) ? registeredReceiptHashes : []),
    ])
  );

  const updatedData: HouseholdData = {
    code,
    tunnelKeyHash: prev?.tunnelKeyHash || hashTunnelKey(incomingKey),
    shoppingItems,
    pantryItems,
    registeredReceiptHashes: mergedHashes,
    updatedAt: Date.now(),
    lastUpdatedBy: lastUpdatedBy || 'Alguien',
  };

  households.set(code, updatedData);
  saveHouseholdsToDisk();

  const safeData = sanitizeHouseholdForClient(updatedData);

  // Notificar en tiempo real al otro teléfono conectado en el túnel privado
  broadcastToHousehold(
    code,
    {
      type: 'sync',
      ...safeData,
    },
    clientId
  );

  const clients = sseClients.get(code);
  return res.json({
    ok: true,
    updatedAt: updatedData.updatedAt,
    registeredReceiptHashes: mergedHashes,
    connectedDevices: clients ? clients.size : 0,
  });
});

// Stream en tiempo real (Server-Sent Events) para sincronización instantánea entre móviles
app.get('/api/household/:code/stream', (req, res) => {
  const code = normalizeCode(req.params.code);
  if (!code || BLOCKED_LEGACY_CODES.has(code)) {
    return res.status(403).json({ error: 'Código público deshabilitado.' });
  }

  const incomingKey = extractTunnelKey(req);
  if (!incomingKey || incomingKey.length < 8) {
    return res.status(401).json({ error: 'Falta clave de túnel.' });
  }

  const currentData = households.get(code);
  if (currentData && !verifyTunnelKey(incomingKey, currentData.tunnelKeyHash)) {
    return res.status(403).json({ error: 'Clave de túnel inválida.' });
  }

  const clientId = String(req.query.clientId || Math.random().toString(36).substring(2));
  const userName = String(req.query.userName || '');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!sseClients.has(code)) {
    sseClients.set(code, new Set());
  }
  const clients = sseClients.get(code)!;
  const clientObj: SSEClient = { id: clientId, res, userName };
  clients.add(clientObj);

  // Enviar estado inicial al conectarse
  res.write(
    `data: ${JSON.stringify({
      type: 'init',
      exists: !!currentData,
      ...(currentData ? sanitizeHouseholdForClient(currentData) : {}),
      connectedDevices: clients.size,
    })}\n\n`
  );

  // Notificar presencia a ambos teléfonos
  broadcastPresence(code);

  // Heartbeat cada 25s para mantener viva la conexión
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(clientObj);
    broadcastPresence(code);
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ocrMode: 'on-device-zero-cost',
    activeHouseholds: households.size,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// SERVIR FRONTEND COMPILADO EN PRODUCCIÓN / NUBE
// ==========================================
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor ComprAI (Zero-Cost On-Device OCR + Sync) activo en http://0.0.0.0:${port}`);
});

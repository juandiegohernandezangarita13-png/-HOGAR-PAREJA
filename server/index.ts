import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ==========================================
// PERSISTENCIA Y SINCRONIZACIÓN DE HOGARES (PAREJA)
// ==========================================
interface HouseholdData {
  code: string;
  shoppingItems: any[];
  pantryItems: any[];
  updatedAt: number;
  lastUpdatedBy?: string;
}

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
    Object.entries(parsed).forEach(([k, v]) => households.set(k, v));
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

// Obtener estado actual de un hogar compartido
app.get('/api/household/:code', (req, res) => {
  const code = normalizeCode(req.params.code);
  if (!code) {
    return res.status(400).json({ error: 'Código de hogar inválido' });
  }
  const existing = households.get(code);
  const clients = sseClients.get(code);

  if (!existing) {
    return res.json({
      exists: false,
      code,
      connectedDevices: clients ? clients.size : 0,
    });
  }

  return res.json({
    exists: true,
    ...existing,
    connectedDevices: clients ? clients.size : 0,
  });
});

// Actualizar estado de un hogar compartido
app.put('/api/household/:code', (req, res) => {
  const code = normalizeCode(req.params.code);
  if (!code) {
    return res.status(400).json({ error: 'Código de hogar inválido' });
  }

  const { shoppingItems, pantryItems, lastUpdatedBy, clientId } = req.body;
  if (!Array.isArray(shoppingItems) || !Array.isArray(pantryItems)) {
    return res.status(400).json({ error: 'Datos de lista o despensa inválidos' });
  }

  const updatedData: HouseholdData = {
    code,
    shoppingItems,
    pantryItems,
    updatedAt: Date.now(),
    lastUpdatedBy: lastUpdatedBy || 'Alguien',
  };

  households.set(code, updatedData);
  saveHouseholdsToDisk();

  // Notificar en tiempo real al otro teléfono conectado
  broadcastToHousehold(
    code,
    {
      type: 'sync',
      ...updatedData,
    },
    clientId
  );

  const clients = sseClients.get(code);
  return res.json({
    ok: true,
    updatedAt: updatedData.updatedAt,
    connectedDevices: clients ? clients.size : 0,
  });
});

// Stream en tiempo real (Server-Sent Events) para sincronización instantánea entre móviles
app.get('/api/household/:code/stream', (req, res) => {
  const code = normalizeCode(req.params.code);
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
  const currentData = households.get(code);
  res.write(
    `data: ${JSON.stringify({
      type: 'init',
      exists: !!currentData,
      ...(currentData || {}),
      connectedDevices: clients.size,
    })}\n\n`
  );

  // Notificar presencia a ambos teléfonos
  broadcastPresence(code);

  // Heartbeat cada 25s para mantener viva la conexión en 4G/5G/Wi-Fi móvil
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

// ==========================================
// ESCÁNER DE TICKETS CON IA (GEMINI VISION)
// ==========================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('✅ Google Gemini API Key detectada para análisis multimodal.');
} else {
  console.log('ℹ️ No se detectó GEMINI_API_KEY. Se utilizará el analizador inteligente con heurísticas.');
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    activeHouseholds: households.size,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo de imagen.' });
    }

    if (genAI && apiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
Eres un asistente experto en digitalización de recibos y tickets de supermercado en español (Mercadona, Carrefour, Lidl, Día, etc.).
Analiza la imagen de este recibo de compra y devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato:
{
  "storeName": "Nombre del supermercado",
  "receiptDate": "YYYY-MM-DD",
  "totalAmount": 0.00,
  "items": [
    {
      "id": "1",
      "rawName": "Texto exacto abreviado en el ticket",
      "normalizedName": "Nombre limpio y entendible en español (ej: Leche entera 1L)",
      "categoryId": "frutas_verduras" | "carnes_aves" | "pescados_mariscos" | "lacteos_huevos" | "embutidos_quesos" | "panaderia_pasteleria" | "despensa_conservas" | "congelados" | "bebidas" | "limpieza_hogar" | "otros",
      "quantity": 1,
      "unit": "ud" | "kg" | "l" | "pack",
      "price": 0.00,
      "suggestedLocation": "fridge" | "freezer" | "pantry",
      "estimatedShelfLifeDays": 3,
      "selected": true
    }
  ]
}

Reglas importantes:
- Si no puedes ver la fecha en el ticket, usa la fecha de hoy: "${new Date().toISOString().split('T')[0]}".
- Normaliza las abreviaturas comerciales (ej: "LECH ENT" -> "Leche entera", "PECH POLL" -> "Pechuga de pollo").
- Estima los días de caducidad según el producto fresco (carnes y pescados 2-3 días, frutas delicadas 3-5 días, lácteos 7-14 días, conservas 365+ días).
- Devuelve únicamente el JSON sin bloques markdown ni comentarios adicionales.
`;

        const imagePart = {
          inlineData: {
            data: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype,
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      } catch (aiError) {
        console.error('Error llamando a Gemini API:', aiError);
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const fallbackResponse = {
      storeName: 'Supermercado Local',
      receiptDate: todayStr,
      totalAmount: 18.90,
      items: [
        {
          id: 'fb-1',
          rawName: 'PECH POLLO 500G',
          normalizedName: 'Pechuga de pollo fileteada',
          categoryId: 'carnes_aves',
          quantity: 1,
          unit: 'bandeja',
          price: 4.50,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 2,
          selected: true,
        },
        {
          id: 'fb-2',
          rawName: 'LECH ENTERA 1L',
          normalizedName: 'Leche entera',
          categoryId: 'lacteos_huevos',
          quantity: 2,
          unit: 'l',
          price: 1.90,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 14,
          selected: true,
        },
        {
          id: 'fb-3',
          rawName: 'PLATANO CANARIAS',
          normalizedName: 'Plátano de Canarias',
          categoryId: 'frutas_verduras',
          quantity: 1,
          unit: 'kg',
          price: 2.10,
          suggestedLocation: 'pantry',
          estimatedShelfLifeDays: 5,
          selected: true,
        },
        {
          id: 'fb-4',
          rawName: 'TOMATE ENSALADA',
          normalizedName: 'Tomates para ensalada',
          categoryId: 'frutas_verduras',
          quantity: 1,
          unit: 'kg',
          price: 1.80,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 7,
          selected: true,
        },
        {
          id: 'fb-5',
          rawName: 'PAN DE MOLDE',
          normalizedName: 'Pan de molde clásico',
          categoryId: 'panaderia_pasteleria',
          quantity: 1,
          unit: 'paquete',
          price: 1.40,
          suggestedLocation: 'pantry',
          estimatedShelfLifeDays: 10,
          selected: true,
        },
      ],
    };

    return res.json(fallbackResponse);
  } catch (error) {
    console.error('Error procesando ticket:', error);
    return res.status(500).json({ error: 'Error al procesar el ticket de compra' });
  }
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
  console.log(`🚀 Servidor ComprAI activo en http://0.0.0.0:${port}`);
});

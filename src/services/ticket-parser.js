import { detectCategoryAndShelfLife, normalizeProductName } from '../data/shelfLifeRules';

/**
 * Tiendas polacas soportadas en detección de cabecera
 */
const POLISH_STORES = [
  { key: 'BIEDRONKA', patterns: [/BIEDRONKA/i, /JERONIMO\s*MARTINS/i] },
  { key: 'LIDL', patterns: [/LIDL/i] },
  { key: 'ŻABKA', patterns: [/[ŻZŹ]ABKA/i] },
  { key: 'DINO', patterns: [/\bDINO\b/i, /DINO\s+POLSKA/i] },
  { key: 'AUCHAN', patterns: [/AUCHAN/i] },
  { key: 'CARREFOUR', patterns: [/CARREFOUR/i] },
  { key: 'NETTO', patterns: [/\bNETTO\b/i] },
  { key: 'KAUFLAND', patterns: [/KAUFLAND/i] },
];

/**
 * Palabras clave de ruido fiscal a ignorar durante la lectura de líneas
 */
const FISCAL_NOISE_REGEX =
  /\b(PODSUMA|PODSUMOWANIE|KASY|KASJER|KIEROWNIK|PARAGON\s*FISKALNY|NIEFISKALNY|KOD|BDO|PTU|PODATEK|STAWKA|NETTO|BRUTTO|NIP|UL\.|AL\.|SP\.\s*Z\s*O\.O\.|SPÓŁKA|SPOLKA|NR\s*SYS|NR:|ROZLICZENIE|PLATNOSC|PŁATNOŚĆ|RESZTA|NALEŻNOŚĆ|NALEZNOSC|ZAPŁACONO|ZAPLACONO|OPODATKOWANA|OPODATK)\b/i;

/**
 * Palabras clave de corte fiscal inmediato (detienen la captura de productos)
 * En cuanto se detecta PODSUMA, SUMA, SPRZEDAŻ OPODATKOWANA, etc., los productos han terminado.
 */
const FISCAL_CUTOFF_REGEX =
  /\b(PODSUMA|PODSUMOWANIE|SUBTOTAL|SUMA\s*PLN|SUMA|RAZEM|SPRZEDA[ŻZ]\s*OPODATK|SPREDARZ\s*OPODATK|DO\s*ZAP[ŁL]ATY|ROZLICZENIE\s*P[ŁL]ATNO[ŚS]CI|KARTA\s*P[ŁL]ATNICZA|KARTA|GOT[ÓO]WKA|GOTOWKA)\b/i;

/**
 * Patrón de precio polaco al final de línea: p.ej. "12,99 A", "4.50 C", "19,99", "5,99C"
 */
const TRAILING_PRICE_REGEX = /(\d+[\.,]\d{2})\s*[A-G]?\s*$/i;

/**
 * Patrón de sublínea de cantidad x precio unitario en tickets polacos:
 * Ej: "1 x5,99 5,99C", "1 szt x 4,99", "0,294 x11,99 3,53C", "2 x 3,50 7,00 A", "0,542 kg * 19,99 10,83 C"
 */
const SUBLINE_QTY_PRICE_REGEX =
  /^(\d+(?:[\.,]\d+)?)\s*(?:szt\.?|kg|g|l|op\.?|opak\.?)?\s*[x\*×]?\s*(\d+[\.,]\d{2})\s*(?:[x\*×]?\s*(\d+[\.,]\d{2})\s*[A-G]?)?\s*$/i;

/**
 * Patrón en una sola línea: "MLEKO UHT 3,2% 2 x 3,49 6,98 C" o "Kukurydza goto. 450g 1 x5,99 5,99C"
 */
const INLINE_QTY_MULTIPLIER_REGEX =
  /^(.+?)\s+(\d+(?:[\.,]\d+)?)\s*(?:szt\.?|kg|g|l|op\.?)?\s*[x\*×]?\s*(\d+[\.,]\d{2})\s+(\d+[\.,]\d{2})\s*[A-G]?\s*$/i;

/**
 * Convierte string numérico con coma o punto a float redondeado a 2 decimales
 * @param {string | number} val
 * @returns {number}
 */
export function parsePolishNumber(val) {
  if (typeof val === 'number') return val;
  const normalized = String(val).trim().replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

/**
 * Limpia prefijos de descuentos, asteriscos promocionales y códigos fiscales finales
 * @param {string} raw
 * @returns {string}
 */
export function cleanPolishProductName(raw) {
  return String(raw || '')
    .replace(/^[\*\-\+#]+/, '')
    .replace(/^(?:OP\.|OPUST|RABAT|PROMOCJA|UPUST)\s*/i, '')
    .replace(/\s+\d+(?:[\.,]\d+)?\s*(?:szt\.?|kg|op\.?)?\s*[x\*×]\s*\d+[\.,]\d{2}.*$/i, '')
    .replace(/\s+[A-G]$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Verifica si un texto extraído parece ruido fiscal o metadato en vez de un artículo de despensa
 * @param {string} name
 * @returns {boolean}
 */
function isNoiseProduct(name) {
  const clean = String(name || '').toLowerCase().trim();
  if (clean.length < 2) return true;
  if (/^(podsuma|suma|razem|ptu|vat|fiskalny|niefiskalny|karta|gotowka|reszta|sprzedaz|spredarz|bdo|nip|nr)/i.test(clean)) return true;
  if (/^\d+$/.test(clean.replace(/\s+/g, ''))) return true;
  if (clean.replace(/[^a-ząćęłńóśźż]/gi, '').length < 2) return true;
  return false;
}

/**
 * Implementación SHA-256 determinista (usa Web Crypto API y fallback JS puro para entornos HTTP locales)
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function sha256Hex(message) {
  const input = String(message || '');
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback a implementación JS pura si el contexto no es HTTPS
    }
  }
  return pureJsSha256(input);
}

/**
 * SHA-256 en JavaScript puro (estándar FIPS 180-4) para soporte en redes Wi-Fi locales sin HTTPS
 * @param {string} ascii
 * @returns {string}
 */
function pureJsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';

  const words = [];
  const utf8 = unescape(encodeURIComponent(ascii));
  const asciiBitLength = utf8.length * 8;

  let hash = [];
  const k = [];
  let primeCounter = 0;

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let str = utf8 + '\x80';
  while ((str.length % 64) - 56) str += '\x00';
  for (let i = 0; i < str.length; i++) {
    const j = str.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Genera el hash único de deduplicación del ticket:
 * hash = SHA256(NIP + FECHA + HORA + TOTAL_PLN)
 *
 * @param {{ nip?: string, fecha?: string, hora?: string, total?: number }} params
 * @returns {Promise<string>}
 */
export async function generateReceiptHash({ nip = '', fecha = '', hora = '', total = 0 }) {
  const cleanNip = String(nip || 'NO-NIP').replace(/[^0-9]/g, '') || 'NO-NIP';
  const cleanFecha = String(fecha || '').trim();
  const cleanHora = String(hora || '00:00').trim();
  const cleanTotal = Number(total || 0).toFixed(2);
  const rawPayload = `${cleanNip}|${cleanFecha}|${cleanHora}|${cleanTotal}`;
  return sha256Hex(rawPayload);
}

/**
 * Parser estructurado para tickets fiscales polacos (`paragon fiskalny`).
 * Recibe un array de líneas detectadas por el OCR y devuelve el JSON normalizado:
 * `{ tienda, fecha, hora, nip, total, hash, productos: Array<{ nombre, precio, cantidad }> }`
 *
 * @param {string[] | string} ocrLines
 * @returns {Promise<{
 *   tienda: string,
 *   nip: string,
 *   fecha: string,
 *   hora: string,
 *   total: number,
 *   hash: string,
 *   productos: Array<{ nombre: string, precio: number, cantidad: number, rawLine?: string }>
 * }>}
 */
export async function parsePolishReceipt(ocrLines) {
  const lines = Array.isArray(ocrLines)
    ? ocrLines.map((l) => String(l || '').trim()).filter(Boolean)
    : String(ocrLines || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

  let tienda = 'Sklep Spożywczy';
  let nip = '';
  let fecha = new Date().toISOString().split('T')[0];
  let hora = '00:00';
  let totalDetectado = 0;

  // 1. Detección global de metadatos (Tienda, NIP, Fecha, Hora y Total)
  for (const line of lines) {
    // Tienda
    if (tienda === 'Sklep Spożywczy') {
      for (const store of POLISH_STORES) {
        if (store.patterns.some((rx) => rx.test(line))) {
          tienda = store.key;
          break;
        }
      }
    }

    // NIP (ej: NIP 7811897358 o NIP: 779-10-11-327)
    if (!nip) {
      const nipMatch = line.match(/NIP[\s:.-]*([0-9\-\s]{10,15})/i);
      if (nipMatch) {
        const digits = nipMatch[1].replace(/[^0-9]/g, '');
        if (digits.length === 10) {
          nip = digits;
        }
      }
    }

    // Fecha: Detectar formatos estándar de caja registradora polaca:
    // YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD
    const isoDateMatch = line.match(/\b(20\d{2})[\-\.\/](0[1-9]|1[0-2])[\-\.\/](0[1-9]|[12]\d|3[01])\b/);
    if (isoDateMatch) {
      fecha = `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
    } else {
      // DD-MM-YYYY o DD.MM.YYYY
      const plDateMatch = line.match(/\b(0[1-9]|[12]\d|3[01])[\-\.\/](0[1-9]|1[0-2])[\-\.\/](20\d{2})\b/);
      if (plDateMatch) {
        fecha = `${plDateMatch[3]}-${plDateMatch[2]}-${plDateMatch[1]}`;
      } else {
        // Formato corto YY-MM-DD (ej: 26-09-26)
        const shortDateMatch = line.match(/\b(2[4-9])[\-\.\/](0[1-9]|1[0-2])[\-\.\/](0[1-9]|[12]\d|3[01])\b/);
        if (shortDateMatch && fecha === new Date().toISOString().split('T')[0]) {
          fecha = `20${shortDateMatch[1]}-${shortDateMatch[2]}-${shortDateMatch[3]}`;
        }
      }
    }

    // Hora formato HH:MM o HH:MM:SS (evitando fechas como 09-26)
    const timeMatch = line.match(/(?:^|[^\d\-])([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?(?:[^\d]|$)/);
    if (timeMatch && (hora === '00:00' || hora === '')) {
      hora = `${timeMatch[1]}:${timeMatch[2]}`;
    }

    // Total explícito en líneas de SUMA PLN / SUMA / DO ZAPŁATY / RAZEM / PODSUMA
    if (/\b(SUMA\s*PLN|SUMA|RAZEM|DO\s*ZAP[ŁL]ATY|PODSUMA)\b/i.test(line)) {
      const totalMatch = line.match(/(\d+[\.,]\d{2})/);
      if (totalMatch) {
        const parsedTotal = parsePolishNumber(totalMatch[1]);
        if (parsedTotal > 0 && (totalDetectado === 0 || /SUMA\s*PLN/i.test(line))) {
          totalDetectado = parsedTotal;
        }
      }
    }
  }

  // 2. Extracción de productos y precios con filtrado de ruido y corte fiscal
  const productos = [];
  let pendingProductName = null;
  let inProductsSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Marcar inicio de sección de productos tras "PARAGON FISKALNY" o cabecera
    if (/PARAGON\s*FISKALNY/i.test(line)) {
      inProductsSection = true;
      pendingProductName = null;
      continue;
    }

    // Regla 4: Corte fiscal inmediato al detectar PODSUMA, SUMA, RAZEM, SPRZEDAŻ OPODATK., KARTA o GOTÓWKA
    if (FISCAL_CUTOFF_REGEX.test(line)) {
      const priceInCutoff = line.match(/(\d+[\.,]\d{2})/);
      if (priceInCutoff && totalDetectado === 0) {
        totalDetectado = parsePolishNumber(priceInCutoff[1]);
      }
      break; // DETENER INMEDIATAMENTE LA CAPTURA DE PRODUCTOS
    }

    // Ignorar líneas de cabecera de la tienda o dirección inicial
    if (POLISH_STORES.some((s) => s.patterns.some((rx) => rx.test(line)))) {
      continue;
    }

    // Regla 2: Filtrado de ruido fiscal (KASY, KIEROWNIK, PARAGON FISKALNY, KOD, BDO, etc.)
    if (FISCAL_NOISE_REGEX.test(line)) {
      pendingProductName = null;
      continue;
    }

    // Si es una línea de descuento ("RABAT", "OPUST", "UPUST") con importe negativo
    if (/^(?:RABAT|OPUST|UPUST|PROMOCJA)\b/i.test(line)) {
      const discountMatch = line.match(/-?\s*(\d+[\.,]\d{2})/);
      if (discountMatch && productos.length > 0) {
        const discountVal = parsePolishNumber(discountMatch[1]);
        const prevProd = productos[productos.length - 1];
        if (discountVal > 0 && prevProd.precio > discountVal) {
          prevProd.precio = Math.round((prevProd.precio - discountVal) * 100) / 100;
        }
      }
      continue;
    }

    // Caso A: Sublínea de cantidad x precio unitario (ej. "1 x5,99 5,99C", "0,294 x11,99 3,53C", "2 x 3,50 7,00 A")
    const sublineMatch = line.match(SUBLINE_QTY_PRICE_REGEX);
    if (sublineMatch) {
      if (pendingProductName) {
        const rawQty = parsePolishNumber(sublineMatch[1]);
        const unitPrice = parsePolishNumber(sublineMatch[2]);
        const lineTotal = sublineMatch[3]
          ? parsePolishNumber(sublineMatch[3])
          : Math.round(rawQty * unitPrice * 100) / 100;

        const cleanName = cleanPolishProductName(pendingProductName);
        if (!isNoiseProduct(cleanName) && lineTotal > 0) {
          productos.push({
            nombre: cleanName,
            precio: lineTotal,
            cantidad: rawQty >= 1 ? Math.round(rawQty * 100) / 100 : 1,
            rawLine: `${pendingProductName} (${line})`,
          });
        }
        pendingProductName = null;
      }
      continue;
    }

    // Caso B: Línea completa con multiplicador en línea ("Kukurydza goto. 450g 1 x5,99 5,99C")
    const inlineMultiMatch = line.match(INLINE_QTY_MULTIPLIER_REGEX);
    if (inlineMultiMatch) {
      const rawName = inlineMultiMatch[1];
      const qty = parsePolishNumber(inlineMultiMatch[2]);
      const lineTotal = parsePolishNumber(inlineMultiMatch[4]);
      const cleanName = cleanPolishProductName(rawName);

      if (!isNoiseProduct(cleanName) && lineTotal > 0) {
        productos.push({
          nombre: cleanName,
          precio: lineTotal,
          cantidad: qty >= 1 ? Math.round(qty * 100) / 100 : 1,
          rawLine: line,
        });
        pendingProductName = null;
        continue;
      }
    }

    // Caso C: Línea con precio al final (`\d+[\.,]\d{2}\s*[A-G]?$`)
    const priceMatch = line.match(TRAILING_PRICE_REGEX);
    if (priceMatch) {
      const priceVal = parsePolishNumber(priceMatch[1]);
      const namePart = line.slice(0, priceMatch.index).trim();

      // Extraer si al final del nombre viene "2 szt x 4,50" o similar
      let qty = 1;
      let cleanedNamePart = namePart;
      const qtyTailMatch = namePart.match(
        /^(.*?)\s+(\d+(?:[\.,]\d+)?)\s*(?:szt\.?|kg|g|l|op\.?)?\s*[x\*×]\s*(\d+[\.,]\d{2})\s*$/i
      );
      if (qtyTailMatch && qtyTailMatch[1].trim().length >= 2) {
        cleanedNamePart = qtyTailMatch[1].trim();
        const parsedQty = parsePolishNumber(qtyTailMatch[2]);
        if (parsedQty > 0) qty = parsedQty;
      }

      const finalName = cleanPolishProductName(
        cleanedNamePart || pendingProductName || ''
      );

      // Descartar si el nombre es metadato fiscal o ruido de caja
      const isNoise =
        isNoiseProduct(finalName) ||
        /^\d{2}[\-\.]\d{3}\b/.test(finalName) ||
        /^(?:NIP|TEL|FAX|NR|KASA|KASY|PTU|STAWKA)\b/i.test(finalName);

      if (!isNoise && priceVal > 0 && priceVal < 5000) {
        productos.push({
          nombre: finalName,
          precio: priceVal,
          cantidad: qty >= 1 ? Math.round(qty) : 1,
          rawLine: line,
        });
        pendingProductName = null;
        continue;
      }
    }

    // Caso D: Línea que contiene el nombre del producto (el precio viene en la sublínea siguiente)
    const hasLetters = line.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, '').length >= 3;
    const isAddressOrZip = /\b\d{2}-\d{3}\b/.test(line);
    const looksLikeCutoff = FISCAL_CUTOFF_REGEX.test(line) || FISCAL_NOISE_REGEX.test(line);

    if (hasLetters && !isAddressOrZip && !looksLikeCutoff) {
      pendingProductName = line;
    }
  }

  // Calcular total si no se leyó explícitamente en la línea SUMA
  const sumProducts =
    Math.round(productos.reduce((acc, p) => acc + p.precio, 0) * 100) / 100;
  const total = totalDetectado > 0 ? totalDetectado : sumProducts;

  // Generar Hash SHA-256 único para deduplicación
  const hash = await generateReceiptHash({
    nip,
    fecha,
    hora,
    total,
  });

  return {
    tienda,
    nip,
    fecha,
    hora,
    total,
    hash,
    productos,
  };
}

/**
 * Transforma la salida estructurada del parser polaco al formato ScannedReceiptResult
 * listo para el modal de verificación interactiva y la despensa compartida.
 *
 * @param {Awaited<ReturnType<typeof parsePolishReceipt>>} parsedTicket
 * @param {string} [rawText]
 * @param {number} [processingTimeMs]
 */
export function mapPolishTicketToScannedResult(parsedTicket, rawText = '', processingTimeMs = 0) {
  const items = parsedTicket.productos.map((prod, index) => {
    const normalized = normalizeProductName(prod.nombre);
    const shelfInfo = detectCategoryAndShelfLife(normalized);

    return {
      id: `ocr-${Date.now()}-${index}`,
      rawName: prod.rawLine || prod.nombre,
      normalizedName: normalized,
      categoryId: shelfInfo.categoryId,
      quantity: prod.cantidad || 1,
      unit: 'szt',
      price: prod.precio,
      suggestedLocation: shelfInfo.suggestedLocation,
      estimatedShelfLifeDays: shelfInfo.shelfLifeDays,
      selected: true,
    };
  });

  return {
    storeName: parsedTicket.tienda,
    receiptDate: parsedTicket.fecha,
    receiptTime: parsedTicket.hora,
    nip: parsedTicket.nip,
    totalAmount: parsedTicket.total,
    currency: 'PLN',
    receiptHash: parsedTicket.hash,
    items,
    rawTextPreview: rawText,
    processingTimeMs,
  };
}

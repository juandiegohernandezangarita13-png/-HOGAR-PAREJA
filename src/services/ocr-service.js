import { Capacitor, registerPlugin } from '@capacitor/core';
import { createWorker } from 'tesseract.js';

/**
 * Abstracción opcional para Google ML Kit Text Recognition en entorno nativo Capacitor (Android/iOS).
 * Si el plugin nativo no está instalado en el binario o corre en PWA/Web, hace fallback automático
 * al Web Worker dedicado de Tesseract.js.
 */
const NativeMlKitTextRecognition = registerPlugin('MlKitTextRecognition');

let sharedWorkerPromise = null;

/**
 * Preprocesa la imagen del ticket en memoria usando HTML5 Canvas:
 * 1. Redimensiona preservando proporciones (ancho óptimo hasta 1800px para nitidez de fuentes térmicas).
 * 2. Convierte a escala de grises de alta precisión.
 * 3. Aplica estiramiento adaptativo de contraste (Percentile Contrast Stretch + Gamma)
 *    para resaltar la tinta térmica tenue y blanquear el papel sin destruir el antialiasing
 *    ni borrar caracteres por fondos oscuros (mesas, portátiles, sombras).
 * Tiempo objetivo de cómputo en memoria: < 350 ms.
 *
 * @param {File | Blob | string} imageSource
 * @returns {Promise<{ dataUrl: string, blob: Blob, width: number, height: number, preprocessTimeMs: number }>}
 */
export async function preprocessReceiptImage(imageSource) {
  const startTime = performance.now();

  const img = await loadImageElement(imageSource);

  const MAX_WIDTH = 1800;
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  // Escalar manteniendo proporción si supera el límite óptimo
  if (targetWidth > MAX_WIDTH) {
    const scale = MAX_WIDTH / targetWidth;
    targetWidth = MAX_WIDTH;
    targetHeight = Math.round(targetHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D del Canvas para preprocesar el ticket.');
  }

  // Dibujar imagen escalada
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;
  const pixelCount = data.length / 4;

  // Paso 1: Conversión a escala de grises y cálculo de histograma
  const grayBuffer = new Uint8Array(pixelCount);
  const histogram = new Uint32Array(256);

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Luminancia ITU-R BT.601 rápida: (77*R + 150*G + 29*B) >> 8
    const lum = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
    grayBuffer[p] = lum;
    histogram[lum]++;
  }

  // Paso 2: Cálculo de percentiles para estiramiento adaptativo de contraste
  // Evita que un fondo oscuro (ej: portátil negro o mesa de madera) arruine el contraste del papel blanco
  const pLowThreshold = Math.round(pixelCount * 0.03);  // Percentil 3 (tinta y sombras oscuras)
  const pHighThreshold = Math.round(pixelCount * 0.97); // Percentil 97 (papel térmico brillante)

  let accum = 0;
  let pLow = 0;
  let pHigh = 255;

  for (let i = 0; i < 256; i++) {
    accum += histogram[i];
    if (pLow === 0 && accum >= pLowThreshold) {
      pLow = i;
    }
    if (accum >= pHighThreshold) {
      pHigh = i;
      break;
    }
  }

  const dynamicRange = Math.max(30, pHigh - pLow);

  // Paso 3: Normalización de contraste suave con corrección gamma
  // Oscurece la tinta térmica tenue y hace blanco el fondo sin binarizar agresivamente a 1-bit,
  // permitiendo que el motor neuronal LSTM de Tesseract utilice los gradientes de borde anti-aliased.
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const lum = grayBuffer[p];
    let stretched = ((lum - pLow) * 255) / dynamicRange;
    if (stretched < 0) stretched = 0;
    if (stretched > 255) stretched = 255;

    // Curva gamma suave (1.25): intensifica caracteres de agujas térmicas manteniendo el papel claro
    const norm = stretched / 255;
    const finalVal = Math.round(255 * Math.pow(norm, 1.25));

    data[i] = finalVal;
    data[i + 1] = finalVal;
    data[i + 2] = finalVal;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.92)
  );

  const preprocessTimeMs = Math.round(performance.now() - startTime);

  return {
    dataUrl,
    blob,
    width: targetWidth,
    height: targetHeight,
    preprocessTimeMs,
  };
}

/**
 * Carga un File, Blob o URL en un HTMLImageElement.
 * @param {File | Blob | string} source
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let objectUrl = null;

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen del ticket para OCR: ' + String(err)));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }
  });
}

/**
 * Obtiene o inicializa el Web Worker dedicado de Tesseract.js con soporte para polaco ('pol').
 * @param {(info: { progress: number, status: string }) => void} [onProgress]
 */
async function getOrCreateTesseractWorker(onProgress) {
  if (!sharedWorkerPromise) {
    sharedWorkerPromise = (async () => {
      const worker = await createWorker('pol', 1, {
        logger: (m) => {
          if (onProgress && typeof m.progress === 'number') {
            onProgress({
              progress: Math.round(m.progress * 100),
              status: m.status || 'Procesando OCR en el dispositivo...',
            });
          }
        },
      });

      // Configuración óptima para tickets fiscales y comprobantes impresos (PSM 6 = bloque uniforme de texto)
      // NOTA: NO se debe usar tessedit_char_whitelist con Tesseract v4/v5 LSTM porque desactiva
      // los diccionarios neuronales y produce cadenas de caracteres incoherentes.
      await worker.setParameters({
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
        preserve_interword_spaces: '1',
      });

      return worker;
    })().catch((err) => {
      sharedWorkerPromise = null;
      throw err;
    });
  }
  return sharedWorkerPromise;
}

/**
 * Ejecuta el pipeline completo de OCR 100% On-Device (Zero-Cost):
 * 1. Preprocesa la imagen en Canvas (contraste adaptativo, preservación de gradientes).
 * 2. Si corre en contenedor nativo Capacitor con ML Kit disponible, usa ML Kit Text Recognition.
 * 3. En PWA / Web o como fallback, ejecuta Tesseract.js en un Web Worker dedicado (pol).
 *
 * @param {File | Blob | string} imageSource
 * @param {{ onProgress?: (info: { step: string, progress: number }) => void }} [options]
 * @returns {Promise<{
 *   rawText: string,
 *   lines: string[],
 *   confidence: number,
 *   engine: 'mlkit-native' | 'tesseract-worker',
 *   preprocessedDataUrl: string,
 *   preprocessTimeMs: number,
 *   totalTimeMs: number
 * }>}
 */
export async function extractReceiptTextOnDevice(imageSource, options = {}) {
  const totalStart = performance.now();
  const { onProgress } = options;

  if (onProgress) {
    onProgress({
      step: 'Preprocesando imagen (escala de grises y contraste adaptativo)...',
      progress: 10,
    });
  }

  const preprocessed = await preprocessReceiptImage(imageSource);

  // 1. Intentar abstracción nativa Google ML Kit On-Device si se ejecuta en Capacitor nativo
  if (Capacitor.isNativePlatform()) {
    try {
      if (onProgress) {
        onProgress({
          step: 'Ejecutando Google ML Kit Text Recognition en el dispositivo...',
          progress: 40,
        });
      }
      const base64Image = preprocessed.dataUrl.split(',')[1];
      const nativeResult = await NativeMlKitTextRecognition.recognizeText({
        base64Image,
        language: 'latin',
      });

      if (nativeResult && typeof nativeResult.text === 'string' && nativeResult.text.trim()) {
        const lines = nativeResult.text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        return {
          rawText: nativeResult.text,
          lines,
          confidence: 95,
          engine: 'mlkit-native',
          preprocessedDataUrl: preprocessed.dataUrl,
          preprocessTimeMs: preprocessed.preprocessTimeMs,
          totalTimeMs: Math.round(performance.now() - totalStart),
        };
      }
    } catch {
      // Fallback transparente al Web Worker dedicado de Tesseract.js
    }
  }

  // 2. Ejecución en Web Worker dedicado con Tesseract.js (PWA / Móvil / Escritorio)
  if (onProgress) {
    onProgress({
      step: 'Iniciando motor OCR polaco (Tesseract Web Worker)...',
      progress: 25,
    });
  }

  const worker = await getOrCreateTesseractWorker(({ progress, status }) => {
    if (onProgress) {
      const mappedProgress = 25 + Math.round(progress * 0.7);
      onProgress({
        step:
          status === 'recognizing text'
            ? `Extrayendo líneas del ticket (${progress}%)...`
            : `Preparando OCR local (${status})...`,
        progress: Math.min(95, mappedProgress),
      });
    }
  });

  const { data } = await worker.recognize(preprocessed.blob);

  const rawText = data?.text || '';
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 1);

  if (onProgress) {
    onProgress({
      step: 'Texto extraído correctamente.',
      progress: 100,
    });
  }

  return {
    rawText,
    lines,
    confidence: Math.round(data?.confidence || 0),
    engine: 'tesseract-worker',
    preprocessedDataUrl: preprocessed.dataUrl,
    preprocessTimeMs: preprocessed.preprocessTimeMs,
    totalTimeMs: Math.round(performance.now() - totalStart),
  };
}

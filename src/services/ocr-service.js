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
 * 1. Redimensiona a un ancho máximo de 1400px conservando el aspect ratio.
 * 2. Convierte a escala de grises (luminancia ITU-R BT.601).
 * 3. Aplica estiramiento de contraste + binarización/umbralización para resaltar tinta térmica.
 * Tiempo objetivo de cómputo en memoria: < 500 ms.
 *
 * @param {File | Blob | string} imageSource
 * @returns {Promise<{ dataUrl: string, blob: Blob, width: number, height: number, preprocessTimeMs: number }>}
 */
export async function preprocessReceiptImage(imageSource) {
  const startTime = performance.now();

  const img = await loadImageElement(imageSource);

  const MAX_WIDTH = 1400;
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

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

  // Paso 1: Conversión a escala de grises y cálculo de luminancia media/mínima/máxima
  const grayBuffer = new Uint8Array(pixelCount);
  let sumLum = 0;
  let minLum = 255;
  let maxLum = 0;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Coeficientes enteros rápidos: (77*R + 150*G + 29*B) >> 8
    const lum = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
    grayBuffer[p] = lum;
    sumLum += lum;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  const meanLum = sumLum / (pixelCount || 1);
  // Umbral adaptativo global ajustado para papel térmico (fondo claro, letras oscuras)
  const dynamicRange = Math.max(1, maxLum - minLum);
  const threshold = Math.min(210, Math.max(115, Math.round(meanLum * 0.86)));

  // Paso 2: Normalización de contraste + binarización suave para OCR térmico
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const normalized = ((grayBuffer[p] - minLum) * 255) / dynamicRange;
    const binaryVal = normalized < threshold ? 0 : 255;
    data[i] = binaryVal;
    data[i + 1] = binaryVal;
    data[i + 2] = binaryVal;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/png', 0.92)
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

      await worker.setParameters({
        // Whitelist de caracteres polacos, dígitos y signos fiscales habituales en paragon fiskalny
        tessedit_char_whitelist:
          'AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻaąbcćdeęfghijklłmnńoópqrsśtuvwxyzźż0123456789.,:-/*%()+=PLNzlłsztkg ',
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
 * 1. Preprocesa la imagen en Canvas (<=1400px, escala de grises y binarización térmica).
 * 2. Si corre en contenedor nativo Capacitor con ML Kit disponible, usa ML Kit Text Recognition.
 * 3. En PWA / Web o como fallback, ejecuta Tesseract.js en un Web Worker dedicado con idioma polaco ('pol').
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
      step: 'Preprocesando imagen (escala de grises y binarización térmica)...',
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

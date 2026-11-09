import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle,
  Loader2,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { ScannedReceiptResult } from '../types';
import { ReceiptReviewModal } from './ReceiptReviewModal';
import { takeNativeReceiptPhoto, isNativePlatform } from '../services/nativePlugins';
import { extractReceiptTextOnDevice } from '../services/ocr-service';
import { parsePolishReceipt, mapPolishTicketToScannedResult } from '../services/ticket-parser';

export const ReceiptScanner: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preprocessedUrl, setPreprocessedUrl] = useState<string | null>(null);
  const [showPreprocessed, setShowPreprocessed] = useState(false);
  const [preprocessTimeMs, setPreprocessTimeMs] = useState<number | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [scannedResult, setScannedResult] = useState<ScannedReceiptResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureCamera = async () => {
    setErrorMessage(null);
    if (isNativePlatform) {
      const result = await takeNativeReceiptPhoto();
      if (result) {
        if (result.file) setSelectedFile(result.file);
        setPreviewUrl(result.previewUrl);
        setPreprocessedUrl(null);
        setScannedResult(null);
        return;
      }
    }
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPreprocessedUrl(null);
      setScannedResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPreprocessedUrl(null);
      setScannedResult(null);
    }
  };

  const runOnDeviceOcrPipeline = async () => {
    const sourceToProcess = selectedFile || previewUrl;
    if (!sourceToProcess) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressPercent(5);
    setProgressStatus('Preprocesando imagen en Canvas (<=1400px, binarización térmica)...');

    try {
      // 1. Ejecutar OCR 100% en el dispositivo (Web Worker Tesseract.js / ML Kit Nativo)
      const ocrResult = await extractReceiptTextOnDevice(sourceToProcess, {
        onProgress: ({ step, progress }) => {
          setProgressStatus(step);
          setProgressPercent(progress);
        },
      });

      setPreprocessedUrl(ocrResult.preprocessedDataUrl);
      setPreprocessTimeMs(ocrResult.preprocessTimeMs);

      // 2. Parsear líneas fiscales polacas (Paragon Fiskalny: Biedronka, Lidl, Żabka, Dino, etc.)
      setProgressStatus('Analizando estructura fiscal polaca (Paragon Fiskalny) y hash SHA-256...');
      setProgressPercent(96);

      const parsedTicket = await parsePolishReceipt(ocrResult.lines);
      const result = mapPolishTicketToScannedResult(
        parsedTicket,
        ocrResult.rawText,
        ocrResult.totalTimeMs
      );

      setScannedResult(result);
      setProgressPercent(100);
      setShowReviewModal(true);
    } catch (err: any) {
      console.error('Error en pipeline OCR On-Device:', err);
      setErrorMessage(
        err?.message ||
          'No se pudo procesar la imagen del ticket. Intenta tomar una foto más nítida con buena iluminación.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Explicativa On-Device Zero-Cost */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-bold backdrop-blur-sm">
              <Cpu className="w-3.5 h-3.5 text-amber-300" />
              <span>100% On-Device OCR (Zero-Cost)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-100 text-xs font-bold backdrop-blur-sm border border-emerald-300/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Optimizado para Polonia (Paragon Fiskalny)</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Escáner Fiscal Polaco en tu Dispositivo
          </h2>
          <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
            Toma una foto de tu ticket de <strong className="text-white">Biedronka, Lidl, Żabka, Dino, Auchan o Carrefour</strong>.
            El preprocesamiento térmico en Canvas y el motor OCR se ejecutan 100% en tu teléfono sin costes de API externas, con deduplicación criptográfica <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs">SHA-256</code>.
          </p>
        </div>
      </div>

      {/* Mensaje de Error si ocurre algún fallo */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-sm">Error al escanear el ticket</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Zona de Captura de Cámara y Selección de Galería */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-dashed border-slate-300 hover:border-indigo-400 transition shadow-sm text-center relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md max-h-80 bg-slate-900 flex items-center justify-center">
              <img
                src={showPreprocessed && preprocessedUrl ? preprocessedUrl : previewUrl}
                alt="Ticket seleccionado"
                className="max-h-80 object-contain"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                {preprocessedUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPreprocessed(!showPreprocessed)}
                    className="bg-indigo-600/90 hover:bg-indigo-700 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPreprocessed ? 'Ver Original' : 'Ver Binarizado'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setPreprocessedUrl(null);
                    setScannedResult(null);
                  }}
                  className="bg-black/65 hover:bg-black text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm cursor-pointer"
                >
                  Cambiar foto
                </button>
              </div>
            </div>

            {preprocessTimeMs !== null && (
              <p className="text-[11px] text-emerald-700 font-semibold">
                ⚡ Imagen binarizada a escala de grises (máx. 1400px) en {preprocessTimeMs} ms
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={runOnDeviceOcrPipeline}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 text-sm transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Escanear Paragon Fiskalny (On-Device OCR)</span>
              </button>

              {scannedResult && (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-3 rounded-xl text-sm transition cursor-pointer"
                >
                  <span>Reabrir Verificación ({scannedResult.items.length})</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="space-y-4 py-6"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-800">
                Captura o selecciona la foto de tu ticket polaco (Paragon Fiskalny)
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Asegúrate de enfocar desde la cabecera (Biedronka, Lidl, Żabka, NIP) hasta la línea de cierre fiscal (SUMA PLN).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCaptureCamera}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Tomar Foto con Cámara</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition cursor-pointer border border-slate-200"
              >
                <Upload className="w-4 h-4" />
                <span>Elegir de la Galería</span>
              </button>
            </div>
          </div>
        )}

        {/* Overlay de Progreso del Worker OCR Local */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 z-20 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-lg">
                Ejecutando OCR Local en tu Dispositivo...
              </h4>
              <p className="text-xs text-slate-500">{progressStatus}</p>
            </div>

            {/* Barra de progreso */}
            <div className="w-full max-w-xs bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${Math.max(8, progressPercent)}%` }}
              />
            </div>

            <div className="max-w-xs w-full space-y-1.5 text-left text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`w-4 h-4 ${
                    progressPercent >= 15 ? 'text-emerald-500' : 'text-slate-300'
                  }`}
                />
                <span>1. Escalado &lt;=1400px y binarización térmica en Canvas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`w-4 h-4 ${
                    progressPercent >= 40 ? 'text-emerald-500' : 'text-slate-300'
                  }`}
                />
                <span>2. Extracción OCR en Web Worker (pol/latino)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`w-4 h-4 ${
                    progressPercent >= 95 ? 'text-emerald-500' : 'text-slate-300'
                  }`}
                />
                <span>3. Parser fiscal polaco + Hash SHA-256 único</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Verificación Interactiva */}
      {showReviewModal && scannedResult && (
        <ReceiptReviewModal
          receiptData={scannedResult}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};

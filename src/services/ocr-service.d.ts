export interface PreprocessedReceiptImage {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  preprocessTimeMs: number;
}

export interface OnDeviceOcrResult {
  rawText: string;
  lines: string[];
  confidence: number;
  engine: 'mlkit-native' | 'tesseract-worker';
  preprocessedDataUrl: string;
  preprocessTimeMs: number;
  totalTimeMs: number;
}

export function preprocessReceiptImage(
  imageSource: File | Blob | string
): Promise<PreprocessedReceiptImage>;

export function extractReceiptTextOnDevice(
  imageSource: File | Blob | string,
  options?: {
    onProgress?: (info: { step: string; progress: number }) => void;
  }
): Promise<OnDeviceOcrResult>;

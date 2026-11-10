import { PolishFiscalTicketParsed, ScannedReceiptResult } from '../types';

export function parsePolishNumber(val: string | number): number;
export function cleanPolishProductName(raw: string): string;
export function sha256Hex(message: string): Promise<string>;
export function generateReceiptHash(params: {
  nip?: string;
  fecha?: string;
  hora?: string;
  total?: number;
}): Promise<string>;
export function parsePolishReceipt(
  ocrLines: string[] | string
): Promise<PolishFiscalTicketParsed>;
export function mapPolishTicketToScannedResult(
  parsedTicket: PolishFiscalTicketParsed,
  rawText?: string,
  processingTimeMs?: number,
  targetLanguage?: import('../i18n/translations').Language
): ScannedReceiptResult;

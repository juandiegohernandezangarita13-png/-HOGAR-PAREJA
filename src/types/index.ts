export type StorageLocation = 'fridge' | 'freezer' | 'pantry';

export type ExpirationStatus = 'expired' | 'warning' | 'good';

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  defaultLocation: StorageLocation;
  defaultShelfLifeDays: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  unit: string;
  isCompleted: boolean;
  notes?: string;
  addedAt: string;
  addedBy?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  categoryId: string;
  location: StorageLocation;
  quantity: number;
  unit: string;
  purchaseDate: string; // ISO date YYYY-MM-DD
  expirationDate: string; // ISO date YYYY-MM-DD
  consumed: boolean;
  notes?: string;
  sourceReceiptStore?: string;
  addedBy?: string;
  price?: number;
}

export interface ScannedReceiptItem {
  id: string;
  rawName: string;
  normalizedName: string;
  categoryId: string;
  quantity: number;
  unit: string;
  price?: number;
  suggestedLocation: StorageLocation;
  estimatedShelfLifeDays: number;
  selected: boolean;
}

export interface PolishFiscalTicketParsed {
  tienda: string;
  nip: string;
  fecha: string;
  hora: string;
  total: number;
  hash: string;
  productos: Array<{
    nombre: string;
    precio: number;
    cantidad: number;
    rawLine?: string;
  }>;
}

export interface ScannedReceiptResult {
  storeName: string;
  receiptDate: string; // YYYY-MM-DD
  receiptTime?: string; // HH:MM
  nip?: string;
  totalAmount?: number;
  currency?: string;
  receiptHash?: string; // SHA-256(NIP + FECHA + HORA + TOTAL_PLN)
  items: ScannedReceiptItem[];
  rawTextPreview?: string;
  processingTimeMs?: number;
}

import { ScannedReceiptResult } from '../types';

export const SAMPLE_RECEIPTS: { id: string; name: string; description: string; data: ScannedReceiptResult }[] = [
  {
    id: 'mercadona-semanal',
    name: 'Ticket Mercadona - Compra Frescos',
    description: 'Ticket con pechuga de pollo, salmón fresco, plátanos de Canarias, leche entera y yogures.',
    data: {
      storeName: 'MERCADONA S.A.',
      receiptDate: new Date().toISOString().split('T')[0],
      totalAmount: 23.45,
      rawTextPreview: `MERCADONA S.A.
C/ Mayor 42, Madrid
FECHA: ${new Date().toISOString().split('T')[0]} 11:42
--------------------------------
1 PECH POLLO FILETES       4.85
1 SALMON FRESCO LOMOS      6.20
1 PLATANO CANARIAS 1.2KG   2.15
6 LECH ENTERA HBRD 1L      5.70
1 YOGUR NAT PACK 8         1.60
1 PAN DE MOLDE BLANCO      1.35
1 TOMATE ENSALADA          1.60
--------------------------------
TOTAL (€)                 23.45`,
      items: [
        {
          id: 'item-1',
          rawName: 'PECH POLLO FILETES',
          normalizedName: 'Pechuga de pollo en filetes',
          categoryId: 'carnes_aves',
          quantity: 1,
          unit: 'bandeja',
          price: 4.85,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 2,
          selected: true,
        },
        {
          id: 'item-2',
          rawName: 'SALMON FRESCO LOMOS',
          normalizedName: 'Salmón fresco en lomos',
          categoryId: 'pescados_mariscos',
          quantity: 1,
          unit: 'bandeja',
          price: 6.20,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 2,
          selected: true,
        },
        {
          id: 'item-3',
          rawName: 'PLATANO CANARIAS 1.2KG',
          normalizedName: 'Plátano de Canarias',
          categoryId: 'frutas_verduras',
          quantity: 1,
          unit: 'kg',
          price: 2.15,
          suggestedLocation: 'pantry',
          estimatedShelfLifeDays: 5,
          selected: true,
        },
        {
          id: 'item-4',
          rawName: 'LECH ENTERA HBRD 1L',
          normalizedName: 'Leche entera 1L',
          categoryId: 'lacteos_huevos',
          quantity: 6,
          unit: 'l',
          price: 5.70,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 14,
          selected: true,
        },
        {
          id: 'item-5',
          rawName: 'YOGUR NAT PACK 8',
          normalizedName: 'Yogur natural pack 8',
          categoryId: 'lacteos_huevos',
          quantity: 1,
          unit: 'pack',
          price: 1.60,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 18,
          selected: true,
        },
        {
          id: 'item-6',
          rawName: 'PAN DE MOLDE BLANCO',
          normalizedName: 'Pan de molde blanco',
          categoryId: 'panaderia_pasteleria',
          quantity: 1,
          unit: 'paquete',
          price: 1.35,
          suggestedLocation: 'pantry',
          estimatedShelfLifeDays: 10,
          selected: true,
        },
        {
          id: 'item-7',
          rawName: 'TOMATE ENSALADA',
          normalizedName: 'Tomate de ensalada',
          categoryId: 'frutas_verduras',
          quantity: 1,
          unit: 'kg',
          price: 1.60,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 8,
          selected: true,
        },
      ],
    },
  },
  {
    id: 'carrefour-despensa',
    name: 'Ticket Carrefour - Despensa y Lácteos',
    description: 'Ticket con huevos camperos, queso curado, arroz redondo, pasta espagueti y atún en lata.',
    data: {
      storeName: 'CARREFOUR EXPRESS',
      receiptDate: new Date().toISOString().split('T')[0],
      totalAmount: 16.80,
      rawTextPreview: `CARREFOUR EXPRESS
Av. Constitucion 12
FECHA: ${new Date().toISOString().split('T')[0]} 18:05
--------------------------------
1 HUEVOS CAMPEROS DOCENA   2.95
1 QUESO CURADO CUÑA        4.20
2 ARROZ REDONDO 1KG        2.30
2 ESPAGUETIS N5 500G       1.80
1 ATUN EN ACEITE PACK 6    5.55
--------------------------------
TOTAL (€)                 16.80`,
      items: [
        {
          id: 'item-c1',
          rawName: 'HUEVOS CAMPEROS DOCENA',
          normalizedName: 'Huevos camperos (12 uds)',
          categoryId: 'lacteos_huevos',
          quantity: 1,
          unit: 'docena',
          price: 2.95,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 21,
          selected: true,
        },
        {
          id: 'item-c2',
          rawName: 'QUESO CURADO CUÑA',
          normalizedName: 'Queso curado en cuña',
          categoryId: 'embutidos_quesos',
          quantity: 1,
          unit: 'cuña',
          price: 4.20,
          suggestedLocation: 'fridge',
          estimatedShelfLifeDays: 45,
          selected: true,
        },
        {
          id: 'item-c3',
          rawName: 'ARROZ REDONDO 1KG',
          normalizedName: 'Arroz redondo 1kg',
          categoryId: 'despensa_conservas',
          quantity: 2,
          unit: 'kg',
          price: 2.30,
          suggestedLocation: 'pantry',
          estimatedShelfLifeDays: 365,
          selected: true,
        },
        {
          id: 'item-c4',
          rawName: 'ESPAGUETIS N5 500G',
          normalizedName: 'Espaguetis nº5 500g',
          categoryId: 'despensa_conservas',
          quantity: 2,
          unit: 'paquete',
          price: 1.80,
          suggestedLocation: 'pantry',
          estimatedShelfLifeDays: 365,
          selected: true,
        },
        {
          id: 'item-c5',
          rawName: 'ATUN EN ACEITE PACK 6',
          normalizedName: 'Atún en aceite de oliva (Pack 6)',
          categoryId: 'despensa_conservas',
          quantity: 1,
          unit: 'pack',
          price: 5.55,
          suggestedLocation: 'pantry',
          estimatedShelfLifeDays: 730,
          selected: true,
        },
      ],
    },
  },
];

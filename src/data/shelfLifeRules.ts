import { CategoryInfo, StorageLocation, ExpirationStatus } from '../types';

export const CATEGORIES: Record<string, CategoryInfo> = {
  frutas_verduras: {
    id: 'frutas_verduras',
    name: 'Frutas y Verduras',
    icon: 'Apple',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    defaultLocation: 'fridge',
    defaultShelfLifeDays: 6,
  },
  carnes_aves: {
    id: 'carnes_aves',
    name: 'Carnes y Aves',
    icon: 'Beef',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    defaultLocation: 'fridge',
    defaultShelfLifeDays: 3,
  },
  pescados_mariscos: {
    id: 'pescados_mariscos',
    name: 'Pescados y Mariscos',
    icon: 'Fish',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    defaultLocation: 'fridge',
    defaultShelfLifeDays: 2,
  },
  lacteos_huevos: {
    id: 'lacteos_huevos',
    name: 'Lácteos y Huevos',
    icon: 'Milk',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    defaultLocation: 'fridge',
    defaultShelfLifeDays: 10,
  },
  embutidos_quesos: {
    id: 'embutidos_quesos',
    name: 'Charcutería y Quesos',
    icon: 'Sandwich',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    defaultLocation: 'fridge',
    defaultShelfLifeDays: 12,
  },
  panaderia_pasteleria: {
    id: 'panaderia_pasteleria',
    name: 'Panadería y Bollería',
    icon: 'Croissant',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    defaultLocation: 'pantry',
    defaultShelfLifeDays: 4,
  },
  despensa_conservas: {
    id: 'despensa_conservas',
    name: 'Despensa y Conservas',
    icon: 'Package',
    color: 'text-stone-700',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
    defaultLocation: 'pantry',
    defaultShelfLifeDays: 180,
  },
  congelados: {
    id: 'congelados',
    name: 'Congelados',
    icon: 'Snowflake',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultLocation: 'freezer',
    defaultShelfLifeDays: 90,
  },
  bebidas: {
    id: 'bebidas',
    name: 'Bebidas',
    icon: 'CupSoda',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    defaultLocation: 'pantry',
    defaultShelfLifeDays: 60,
  },
  limpieza_hogar: {
    id: 'limpieza_hogar',
    name: 'Limpieza y Hogar',
    icon: 'Sparkles',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    defaultLocation: 'pantry',
    defaultShelfLifeDays: 365,
  },
  otros: {
    id: 'otros',
    name: 'Otros',
    icon: 'Layers',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    defaultLocation: 'pantry',
    defaultShelfLifeDays: 30,
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

interface ProductPattern {
  keywords: string[];
  category: string;
  shelfLifeDays: number;
  location: StorageLocation;
  normalizedExample?: string;
}

const SPECIFIC_PRODUCT_RULES: ProductPattern[] = [
  // Pescados y mariscos
  { keywords: ['pescado', 'merluza', 'salmon', 'salmón', 'lubina', 'dorada', 'bacalao', 'atun fresco', 'atún fresco', 'gamba', 'langostino'], category: 'pescados_mariscos', shelfLifeDays: 2, location: 'fridge' },
  { keywords: ['mejillon', 'almeja', 'pulpo', 'calamar', 'sepia'], category: 'pescados_mariscos', shelfLifeDays: 2, location: 'fridge' },

  // Carnes y aves
  { keywords: ['pollo', 'pechuga', 'alitas', 'pavo', 'carne picada', 'hamburguesa'], category: 'carnes_aves', shelfLifeDays: 2, location: 'fridge' },
  { keywords: ['ternera', 'cerdo', 'lomo', 'costilla', 'solomillo', 'chuleta'], category: 'carnes_aves', shelfLifeDays: 4, location: 'fridge' },
  { keywords: ['conejo', 'cordero'], category: 'carnes_aves', shelfLifeDays: 3, location: 'fridge' },

  // Frutas frescas y delicadas
  { keywords: ['fresa', 'fresón', 'frambuesa', 'arandano', 'arándano', 'mora'], category: 'frutas_verduras', shelfLifeDays: 3, location: 'fridge' },
  { keywords: ['platano', 'plátano', 'banana', 'aguacate', 'pera', 'melocoton', 'melocotón'], category: 'frutas_verduras', shelfLifeDays: 5, location: 'pantry' },
  { keywords: ['manzana', 'naranja', 'mandarina', 'limon', 'limón'], category: 'frutas_verduras', shelfLifeDays: 14, location: 'pantry' },

  // Verduras
  { keywords: ['lechuga', 'espinaca', 'canónigos', 'rucula', 'rúcula', 'brocoli', 'brócoli', 'champinon', 'champiñón', 'setas'], category: 'frutas_verduras', shelfLifeDays: 4, location: 'fridge' },
  { keywords: ['tomate', 'pepino', 'pimiento', 'zanahoria', 'calabacin', 'calabacín'], category: 'frutas_verduras', shelfLifeDays: 8, location: 'fridge' },
  { keywords: ['patata', 'papa', 'cebolla', 'ajo', 'calabaza'], category: 'frutas_verduras', shelfLifeDays: 30, location: 'pantry' },

  // Lácteos y huevos
  { keywords: ['huevo', 'huevos'], category: 'lacteos_huevos', shelfLifeDays: 21, location: 'fridge' },
  { keywords: ['leche fresca', 'leche pasteurizada'], category: 'lacteos_huevos', shelfLifeDays: 5, location: 'fridge' },
  { keywords: ['leche', 'lech'], category: 'lacteos_huevos', shelfLifeDays: 14, location: 'fridge' },
  { keywords: ['yogur', 'yogurt', 'natillas', 'flan', 'kefir', 'kéfir'], category: 'lacteos_huevos', shelfLifeDays: 18, location: 'fridge' },
  { keywords: ['mantequilla', 'nata'], category: 'lacteos_huevos', shelfLifeDays: 25, location: 'fridge' },

  // Quesos y embutidos
  { keywords: ['queso fresco', 'mozzarella', 'ricotta', 'burrata'], category: 'embutidos_quesos', shelfLifeDays: 5, location: 'fridge' },
  { keywords: ['queso curado', 'queso semi', 'parmesano', 'manchego'], category: 'embutidos_quesos', shelfLifeDays: 45, location: 'fridge' },
  { keywords: ['jamon york', 'jamón york', 'pavo lonchas', 'chopped', 'mortadela'], category: 'embutidos_quesos', shelfLifeDays: 6, location: 'fridge' },
  { keywords: ['jamon serrano', 'jamón ibérico', 'chorizo', 'salchichon', 'fuet'], category: 'embutidos_quesos', shelfLifeDays: 20, location: 'fridge' },

  // Panadería
  { keywords: ['pan barra', 'baguette', 'pan fresco', 'barra pan'], category: 'panaderia_pasteleria', shelfLifeDays: 2, location: 'pantry' },
  { keywords: ['pan molde', 'pan de molde', 'tostadas', 'croissant', 'magdalenas'], category: 'panaderia_pasteleria', shelfLifeDays: 10, location: 'pantry' },

  // Congelados
  { keywords: ['congelado', 'helado', 'pizza congelada', 'varitas de merluza', 'verdura congelada'], category: 'congelados', shelfLifeDays: 120, location: 'freezer' },

  // Despensa y conservas
  { keywords: ['atun lata', 'atún lata', 'sardinas lata', 'conserva', 'lentejas bote', 'garbanzos bote'], category: 'despensa_conservas', shelfLifeDays: 730, location: 'pantry' },
  { keywords: ['pasta', 'espaguetis', 'macarrones', 'arroz', 'harina', 'legumbres'], category: 'despensa_conservas', shelfLifeDays: 365, location: 'pantry' },
  { keywords: ['aceite', 'vinagre', 'sal', 'azucar', 'azúcar', 'especias', 'cafe', 'café'], category: 'despensa_conservas', shelfLifeDays: 365, location: 'pantry' },
  { keywords: ['galletas', 'cereal', 'cereales', 'chocolate'], category: 'despensa_conservas', shelfLifeDays: 90, location: 'pantry' },

  // Bebidas
  { keywords: ['agua', 'zumo', 'refresco', 'cola', 'cerveza', 'vino'], category: 'bebidas', shelfLifeDays: 90, location: 'pantry' },

  // Limpieza
  { keywords: ['lejia', 'detergente', 'suavizante', 'lavavajillas', 'papel higienico', 'champu', 'gel'], category: 'limpieza_hogar', shelfLifeDays: 365, location: 'pantry' }
];

export function normalizeProductName(rawName: string): string {
  let clean = rawName
    .replace(/^(\d+\.?\d*|\d+x\d+)\s*(kg|g|l|ml|ud|pack|uds|gr)?\s*[\*x-]?\s*/i, '')
    .trim();

  // Diccionario común de tickets españoles
  const replacements: Record<string, string> = {
    'lech ent': 'Leche entera',
    'lech desn': 'Leche desnatada',
    'lech sem': 'Leche semidesnatada',
    'pech poll': 'Pechuga de pollo',
    'plat canar': 'Plátano de Canarias',
    'tom ensal': 'Tomate de ensalada',
    'pan mold': 'Pan de molde',
    'huev cam': 'Huevos camperos',
    'yog nat': 'Yogur natural',
    'qso cur': 'Queso curado',
    'espag': 'Espaguetis',
    'arroz red': 'Arroz redondo',
    'aceit oliv': 'Aceite de oliva',
    'pap hig': 'Papel higiénico',
  };

  const lower = clean.toLowerCase();
  for (const [abbr, full] of Object.entries(replacements)) {
    if (lower.includes(abbr)) {
      return full;
    }
  }

  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }
  return clean || rawName;
}

export function detectCategoryAndShelfLife(productName: string): {
  categoryId: string;
  shelfLifeDays: number;
  suggestedLocation: StorageLocation;
} {
  const lower = productName.toLowerCase();

  for (const rule of SPECIFIC_PRODUCT_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return {
          categoryId: rule.category,
          shelfLifeDays: rule.shelfLifeDays,
          suggestedLocation: rule.location,
        };
      }
    }
  }

  // Fallback por defecto
  return {
    categoryId: 'otros',
    shelfLifeDays: 14,
    suggestedLocation: 'pantry',
  };
}

export function calculateExpirationDate(startDate: string, days: number): string {
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + days);
    return fallback.toISOString().split('T')[0];
  }
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getDaysRemaining(expirationDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpirationStatus(expirationDate: string): {
  status: ExpirationStatus;
  daysRemaining: number;
  label: string;
} {
  const days = getDaysRemaining(expirationDate);

  if (days < 0) {
    return {
      status: 'expired',
      daysRemaining: days,
      label: `Caducó hace ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`,
    };
  } else if (days === 0) {
    return {
      status: 'warning',
      daysRemaining: 0,
      label: 'Caduca hoy',
    };
  } else if (days <= 3) {
    return {
      status: 'warning',
      daysRemaining: days,
      label: `Caduca en ${days} día${days === 1 ? '' : 's'}`,
    };
  } else {
    return {
      status: 'good',
      daysRemaining: days,
      label: `Vence en ${days} días`,
    };
  }
}

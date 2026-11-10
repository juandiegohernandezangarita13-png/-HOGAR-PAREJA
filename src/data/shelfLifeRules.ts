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
}

const SPECIFIC_PRODUCT_RULES: ProductPattern[] = [
  // Pescados y mariscos (ES + PL)
  {
    keywords: [
      'pescado', 'merluza', 'salmon', 'salmón', 'lubina', 'dorada', 'bacalao', 'atun fresco', 'gamba', 'langostino',
      'łosoś', 'losos', 'dorsz', 'ryba', 'pstrąg', 'pstrag', 'śledź', 'sledz', 'makrela', 'krewetki',
    ],
    category: 'pescados_mariscos',
    shelfLifeDays: 2,
    location: 'fridge',
  },
  {
    keywords: ['mejillon', 'almeja', 'pulpo', 'calamar', 'sepia'],
    category: 'pescados_mariscos',
    shelfLifeDays: 2,
    location: 'fridge',
  },

  // Carnes y aves (ES + PL)
  {
    keywords: [
      'pollo', 'pechuga', 'alitas', 'pavo', 'carne picada', 'hamburguesa',
      'kurczak', 'pierś', 'piers', 'filet z piersi', 'indyk', 'mięso mielone', 'mieso mielone', 'drób', 'drob', 'skrzydełka', 'udziec',
    ],
    category: 'carnes_aves',
    shelfLifeDays: 3,
    location: 'fridge',
  },
  {
    keywords: [
      'ternera', 'cerdo', 'lomo', 'costilla', 'solomillo', 'chuleta',
      'wieprz', 'schab', 'wołow', 'wolow', 'karkówka', 'karkowka', 'boczek', 'żeberka',
    ],
    category: 'carnes_aves',
    shelfLifeDays: 4,
    location: 'fridge',
  },

  // Frutas frescas y delicadas (ES + PL)
  {
    keywords: [
      'fresa', 'fresón', 'frambuesa', 'arandano', 'arándano', 'mora',
      'truskawk', 'malin', 'borówk', 'borowk', 'jagod',
    ],
    category: 'frutas_verduras',
    shelfLifeDays: 3,
    location: 'fridge',
  },
  {
    keywords: [
      'platano', 'plátano', 'banana', 'aguacate', 'pera', 'melocoton',
      'banan', 'awokado', 'gruszk', 'brzoskwin', 'winogron',
    ],
    category: 'frutas_verduras',
    shelfLifeDays: 5,
    location: 'pantry',
  },
  {
    keywords: [
      'manzana', 'naranja', 'mandarina', 'limon', 'limón',
      'jabłk', 'jablk', 'pomarańcz', 'pomarancz', 'mandarynk', 'cytryn',
    ],
    category: 'frutas_verduras',
    shelfLifeDays: 14,
    location: 'pantry',
  },

  // Verduras (ES + PL + EN)
  {
    keywords: [
      'lechuga', 'espinaca', 'canónigos', 'rucula', 'rúcula', 'brocoli', 'brócoli', 'champinon', 'champiñon', 'champiñón', 'champiñones', 'setas', 'berenjena', 'berenjenas', 'maiz', 'maíz', 'calabacin', 'calabacín',
      'sałata', 'salata', 'szpinak', 'rukola', 'brokuł', 'brokul', 'pieczark', 'koperek', 'natka', 'szczypior', 'bakłażan', 'baklazan', 'kukurydza',
      'lettuce', 'spinach', 'arugula', 'rocket', 'broccoli', 'mushroom', 'mushrooms', 'eggplant', 'aubergine', 'corn', 'zucchini',
    ],
    category: 'frutas_verduras',
    shelfLifeDays: 5,
    location: 'fridge',
  },
  {
    keywords: [
      'tomate', 'pepino', 'pimiento', 'zanahoria', 'calabacin',
      'pomidor', 'ogórek', 'ogorek', 'papryk', 'marchew', 'cukini', 'rzodkiew', 'kalafior',
    ],
    category: 'frutas_verduras',
    shelfLifeDays: 8,
    location: 'fridge',
  },
  {
    keywords: [
      'patata', 'papa', 'cebolla', 'ajo', 'calabaza',
      'ziemniak', 'cebul', 'czosnek', 'dynia', 'burak',
    ],
    category: 'frutas_verduras',
    shelfLifeDays: 30,
    location: 'pantry',
  },

  // Lácteos y huevos (ES + PL)
  {
    keywords: ['huevo', 'huevos', 'jaja', 'jajka', 'jajko'],
    category: 'lacteos_huevos',
    shelfLifeDays: 21,
    location: 'fridge',
  },
  {
    keywords: ['leche fresca', 'leche pasteurizada', 'mleko świeże', 'mleko swieze'],
    category: 'lacteos_huevos',
    shelfLifeDays: 5,
    location: 'fridge',
  },
  {
    keywords: ['leche', 'lech', 'mleko', 'mlek'],
    category: 'lacteos_huevos',
    shelfLifeDays: 14,
    location: 'fridge',
  },
  {
    keywords: [
      'yogur', 'yogurt', 'natillas', 'flan', 'kefir', 'kéfir',
      'jogurt', 'maślanka', 'maslanka', 'serek wiejski', 'skyrem', 'skyr', 'deser mleczny',
    ],
    category: 'lacteos_huevos',
    shelfLifeDays: 14,
    location: 'fridge',
  },
  {
    keywords: [
      'mantequilla', 'nata',
      'masło', 'maslo', 'śmietana', 'smietana', 'śmietanka', 'margaryna',
    ],
    category: 'lacteos_huevos',
    shelfLifeDays: 25,
    location: 'fridge',
  },

  // Quesos y embutidos (ES + PL)
  {
    keywords: [
      'queso fresco', 'mozzarella', 'ricotta', 'burrata',
      'twaróg', 'twarog', 'twarożek', 'feta', 'serek',
    ],
    category: 'embutidos_quesos',
    shelfLifeDays: 6,
    location: 'fridge',
  },
  {
    keywords: [
      'queso curado', 'queso semi', 'parmesano', 'manchego',
      'ser gouda', 'ser żółty', 'ser zolty', 'ser edamski', 'ser królewski', 'ser podlaski', 'cheddar',
    ],
    category: 'embutidos_quesos',
    shelfLifeDays: 21,
    location: 'fridge',
  },
  {
    keywords: [
      'jamon york', 'jamón york', 'pavo lonchas', 'chopped', 'mortadela',
      'szynka', 'polędwica', 'poledwica', 'parówki', 'parowki', 'kiełbasa', 'kielbasa', 'kabanos', 'salami', 'pasztet',
    ],
    category: 'embutidos_quesos',
    shelfLifeDays: 7,
    location: 'fridge',
  },

  // Panadería (ES + PL)
  {
    keywords: [
      'pan barra', 'baguette', 'pan fresco', 'barra pan',
      'chleb', 'bułka', 'bulka', 'kajzerka', 'bagietka', 'rogal', 'pączek', 'paczek', 'drożdżówka',
    ],
    category: 'panaderia_pasteleria',
    shelfLifeDays: 3,
    location: 'pantry',
  },
  {
    keywords: ['pan molde', 'pan de molde', 'tostadas', 'croissant', 'chleb tostowy', 'tortilla'],
    category: 'panaderia_pasteleria',
    shelfLifeDays: 10,
    location: 'pantry',
  },

  // Congelados (ES + PL)
  {
    keywords: [
      'congelado', 'helado', 'pizza congelada',
      'mrożon', 'mrozon', 'lody', 'frytki', 'pierogi mroż',
    ],
    category: 'congelados',
    shelfLifeDays: 120,
    location: 'freezer',
  },

  // Despensa y conservas (ES + PL)
  {
    keywords: [
      'atun lata', 'conserva', 'lentejas bote',
      'tuńczyk', 'tunczyk', 'kukurydza', 'groszek', 'fasola', 'konserwa', 'przecier', 'passata',
    ],
    category: 'despensa_conservas',
    shelfLifeDays: 365,
    location: 'pantry',
  },
  {
    keywords: [
      'pasta', 'espaguetis', 'macarrones', 'arroz', 'harina', 'legumbres',
      'makaron', 'ryż', 'ryz', 'mąka', 'maka', 'kasza', 'płatki', 'platki',
    ],
    category: 'despensa_conservas',
    shelfLifeDays: 365,
    location: 'pantry',
  },
  {
    keywords: [
      'aceite', 'vinagre', 'sal', 'azucar', 'azúcar', 'cafe', 'café',
      'olej', 'oliwa', 'cukier', 'sól', 'sol', 'kawa', 'herbata', 'ketchup', 'majonez', 'musztarda',
    ],
    category: 'despensa_conservas',
    shelfLifeDays: 365,
    location: 'pantry',
  },
  {
    keywords: [
      'galletas', 'cereal', 'chocolate',
      'czekolad', 'ciastk', 'baton', 'chipsy', 'wafel',
    ],
    category: 'despensa_conservas',
    shelfLifeDays: 90,
    location: 'pantry',
  },

  // Bebidas (ES + PL)
  {
    keywords: [
      'agua', 'zumo', 'refresco', 'cola', 'cerveza', 'vino',
      'woda', 'sok', 'napój', 'napoj', 'piwo', 'wino', 'pepsi', 'tymbark', 'żubr', 'zubr', 'tyskie',
    ],
    category: 'bebidas',
    shelfLifeDays: 90,
    location: 'pantry',
  },

  // Limpieza (ES + PL)
  {
    keywords: [
      'lejia', 'detergente', 'suavizante', 'lavavajillas', 'papel higienico', 'champu', 'gel',
      'papier toalet', 'ręcznik', 'recznik', 'mydło', 'mydlo', 'szampon', 'płyn do', 'plyn do', 'proszek', 'kapsułki',
    ],
    category: 'limpieza_hogar',
    shelfLifeDays: 365,
    location: 'pantry',
  },
];

export function normalizeProductName(rawName: string): string {
  let clean = rawName
    .replace(/^(\*+|OP\.|RABAT|PROMOCJA)\s*/i, '')
    .replace(/\s+[A-G]$/i, '')
    .trim();

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

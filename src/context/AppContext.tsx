import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingItem, PantryItem, ScannedReceiptItem } from '../types';
import { calculateExpirationDate, detectCategoryAndShelfLife } from '../data/shelfLifeRules';
import {
  Language,
  detectDeviceLanguage,
  TRANSLATIONS,
  TranslationDictionary,
  CATEGORY_TRANSLATIONS,
} from '../i18n/translations';
import confetti from 'canvas-confetti';

export type SyncStatus = 'local' | 'connecting' | 'synced' | 'error';

interface AppContextType {
  activeTab: 'shopping' | 'pantry' | 'scanner';
  setActiveTab: (tab: 'shopping' | 'pantry' | 'scanner') => void;

  // Idioma del dispositivo y traducciones
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  getCategoryName: (categoryId: string) => string;

  // Política de Privacidad (RODO / RGPD)
  showPrivacyModal: boolean;
  setShowPrivacyModal: (show: boolean) => void;

  // Sincronización en Pareja / Hogar Compartido
  householdCode: string;
  setHouseholdCode: (code: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  syncStatus: SyncStatus;
  connectedDevices: number;
  lastUpdatedBy: string | null;
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  forceSyncNow: () => Promise<void>;

  // Deduplicación de tickets (SHA-256)
  registeredReceiptHashes: string[];
  checkReceiptDuplicate: (hash: string) => Promise<boolean>;

  // Lista de Compra
  shoppingItems: ShoppingItem[];
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'isCompleted'>) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCompletedShoppingItems: () => void;
  moveCompletedToPantry: () => void;

  // Despensa / Inventario
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id' | 'consumed'>) => void;
  addPantryItemsFromReceipt: (
    items: ScannedReceiptItem[],
    receiptDate: string,
    storeName?: string,
    receiptHash?: string
  ) => void;
  removePantryItem: (id: string) => void;
  markPantryItemConsumed: (id: string) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  readdPantryItemToShopping: (pantryItem: PantryItem) => void;

  // Estadísticas rápidas
  stats: {
    shoppingPending: number;
    shoppingCompleted: number;
    pantryTotal: number;
    pantryExpiringSoon: number;
    pantryExpired: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 's-1',
    name: 'Mleko 3,2%',
    categoryId: 'lacteos_huevos',
    quantity: 2,
    unit: 'szt',
    isCompleted: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 's-2',
    name: 'Filet z piersi kurczaka',
    categoryId: 'carnes_aves',
    quantity: 1,
    unit: 'op',
    isCompleted: false,
    notes: 'Na kolację',
    addedAt: new Date().toISOString(),
  },
];

const INITIAL_PANTRY_ITEMS: PantryItem[] = [];

const normalizeHouseholdCode = (raw: string) =>
  raw.trim().toUpperCase().replace(/[^A-Z0-9-_]/g, '').slice(0, 24);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'shopping' | 'pantry' | 'scanner'>('shopping');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Detección automática del idioma del dispositivo (pl / es / en)
  const [language, setLanguageState] = useState<Language>(() => detectDeviceLanguage());

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('comprai_language', newLang);
    } catch {
      // ignore
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.pl;

  const getCategoryName = useCallback(
    (categoryId: string) => {
      const catDict = CATEGORY_TRANSLATIONS[language] || CATEGORY_TRANSLATIONS.pl;
      return catDict[categoryId] || categoryId;
    },
    [language]
  );

  const clientIdRef = useRef<string>(
    'client-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8)
  );

  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem('comprai_user_name') || '';
  });

  const [householdCode, setHouseholdCodeState] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('hogar');
      if (urlCode) {
        const clean = normalizeHouseholdCode(urlCode);
        if (clean) {
          localStorage.setItem('comprai_household_code', clean);
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', newUrl);
          return clean;
        }
      }
    } catch {
      // ignore
    }
    return localStorage.getItem('comprai_household_code') || 'HOGAR-PAREJA';
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [connectedDevices, setConnectedDevices] = useState<number>(1);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('comprai_shopping_items');
      return saved ? JSON.parse(saved) : INITIAL_SHOPPING_ITEMS;
    } catch {
      return INITIAL_SHOPPING_ITEMS;
    }
  });

  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem('comprai_pantry_items');
      return saved ? JSON.parse(saved) : INITIAL_PANTRY_ITEMS;
    } catch {
      return INITIAL_PANTRY_ITEMS;
    }
  });

  const [registeredReceiptHashes, setRegisteredReceiptHashes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('comprai_receipt_hashes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const shoppingRef = useRef(shoppingItems);
  const pantryRef = useRef(pantryItems);
  const hashesRef = useRef(registeredReceiptHashes);
  const isApplyingRemoteRef = useRef(false);

  useEffect(() => {
    shoppingRef.current = shoppingItems;
    localStorage.setItem('comprai_shopping_items', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    pantryRef.current = pantryItems;
    localStorage.setItem('comprai_pantry_items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    hashesRef.current = registeredReceiptHashes;
    localStorage.setItem('comprai_receipt_hashes', JSON.stringify(registeredReceiptHashes));
  }, [registeredReceiptHashes]);

  const setUserName = (name: string) => {
    const trimmed = name.trim();
    setUserNameState(trimmed);
    localStorage.setItem('comprai_user_name', trimmed);
  };

  const setHouseholdCode = (code: string) => {
    const clean = normalizeHouseholdCode(code);
    setHouseholdCodeState(clean);
    if (clean) {
      localStorage.setItem('comprai_household_code', clean);
    } else {
      localStorage.removeItem('comprai_household_code');
    }
  };

  // Empujar cambios locales al servidor compartido
  const pushToServer = useCallback(
    async (
      nextShopping: ShoppingItem[],
      nextPantry: PantryItem[],
      nextHashes: string[] = hashesRef.current
    ) => {
      if (!householdCode) {
        setSyncStatus('local');
        return;
      }
      try {
        const res = await fetch(`/api/household/${encodeURIComponent(householdCode)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shoppingItems: nextShopping,
            pantryItems: nextPantry,
            registeredReceiptHashes: nextHashes,
            lastUpdatedBy: userName || 'Partner',
            clientId: clientIdRef.current,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSyncStatus('synced');
          if (typeof data.connectedDevices === 'number') {
            setConnectedDevices(Math.max(1, data.connectedDevices));
          }
          if (Array.isArray(data.registeredReceiptHashes)) {
            setRegisteredReceiptHashes(data.registeredReceiptHashes);
          }
        } else {
          setSyncStatus('error');
        }
      } catch {
        setSyncStatus('error');
      }
    },
    [householdCode, userName]
  );

  // Verificar contra base de datos local y remota si el hash SHA-256 ya fue registrado
  const checkReceiptDuplicate = useCallback(
    async (hash: string): Promise<boolean> => {
      if (!hash) return false;
      const cleanHash = hash.trim().toLowerCase();

      if (hashesRef.current.some((h) => h.toLowerCase() === cleanHash)) {
        return true;
      }

      if (householdCode) {
        try {
          const res = await fetch(
            `/api/household/${encodeURIComponent(householdCode)}/receipt-hash/${encodeURIComponent(
              cleanHash
            )}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.isDuplicate) {
              return true;
            }
          }
        } catch {
          // offline
        }
      }

      return false;
    },
    [householdCode]
  );

  // Obtener o inicializar estado desde el servidor
  const forceSyncNow = useCallback(async () => {
    if (!householdCode) {
      setSyncStatus('local');
      return;
    }
    try {
      setSyncStatus('connecting');
      const res = await fetch(`/api/household/${encodeURIComponent(householdCode)}`);
      if (!res.ok) {
        setSyncStatus('error');
        return;
      }
      const data = await res.json();
      if (data.exists && Array.isArray(data.shoppingItems) && Array.isArray(data.pantryItems)) {
        isApplyingRemoteRef.current = true;
        setShoppingItems(data.shoppingItems);
        setPantryItems(data.pantryItems);
        if (Array.isArray(data.registeredReceiptHashes)) {
          const merged = Array.from(
            new Set([...hashesRef.current, ...data.registeredReceiptHashes])
          );
          setRegisteredReceiptHashes(merged);
        }
        if (data.lastUpdatedBy) setLastUpdatedBy(data.lastUpdatedBy);
        if (typeof data.connectedDevices === 'number') {
          setConnectedDevices(Math.max(1, data.connectedDevices));
        }
        setSyncStatus('synced');
        setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 50);
      } else {
        await pushToServer(shoppingRef.current, pantryRef.current, hashesRef.current);
      }
    } catch {
      setSyncStatus('error');
    }
  }, [householdCode, pushToServer]);

  // Conexión en tiempo real (Server-Sent Events)
  useEffect(() => {
    if (!householdCode) {
      setSyncStatus('local');
      return;
    }

    forceSyncNow();

    const streamUrl = `/api/household/${encodeURIComponent(
      householdCode
    )}/stream?clientId=${encodeURIComponent(clientIdRef.current)}&userName=${encodeURIComponent(
      userName || ''
    )}`;

    const es = new EventSource(streamUrl);

    es.onopen = () => {
      setSyncStatus('synced');
    };

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (typeof payload.connectedDevices === 'number') {
          setConnectedDevices(Math.max(1, payload.connectedDevices));
        }

        if (payload.type === 'sync' || (payload.type === 'init' && payload.exists)) {
          if (Array.isArray(payload.shoppingItems) && Array.isArray(payload.pantryItems)) {
            isApplyingRemoteRef.current = true;
            setShoppingItems(payload.shoppingItems);
            setPantryItems(payload.pantryItems);
            if (Array.isArray(payload.registeredReceiptHashes)) {
              setRegisteredReceiptHashes(payload.registeredReceiptHashes);
            }
            if (payload.lastUpdatedBy) {
              setLastUpdatedBy(payload.lastUpdatedBy);
            }
            setSyncStatus('synced');
            setTimeout(() => {
              isApplyingRemoteRef.current = false;
            }, 50);
          }
        }
      } catch {
        // ignore
      }
    };

    es.onerror = () => {
      setSyncStatus('error');
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        forceSyncNow();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      es.close();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [householdCode, userName, forceSyncNow]);

  // Acciones de Lista de Compra
  const addShoppingItem = (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'isCompleted'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      isCompleted: false,
      addedAt: new Date().toISOString(),
      addedBy: userName || undefined,
    };
    setShoppingItems((prev) => {
      const next = [newItem, ...prev];
      pushToServer(next, pantryRef.current, hashesRef.current);
      return next;
    });
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingItems((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const newState = !item.isCompleted;
          if (newState) {
            try {
              confetti({
                particleCount: 25,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#10b981', '#34d399', '#6ee7b7'],
              });
            } catch {
              // ignore
            }
          }
          return { ...item, isCompleted: newState };
        }
        return item;
      });
      pushToServer(next, pantryRef.current, hashesRef.current);
      return next;
    });
  };

  const removeShoppingItem = (id: string) => {
    setShoppingItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      pushToServer(next, pantryRef.current, hashesRef.current);
      return next;
    });
  };

  const clearCompletedShoppingItems = () => {
    setShoppingItems((prev) => {
      const next = prev.filter((item) => !item.isCompleted);
      pushToServer(next, pantryRef.current, hashesRef.current);
      return next;
    });
  };

  const moveCompletedToPantry = () => {
    const completed = shoppingItems.filter((item) => item.isCompleted);
    if (completed.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newPantryItems: PantryItem[] = completed.map((item) => {
      const shelfLife = detectCategoryAndShelfLife(item.name);
      return {
        id: 'pantry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: item.name,
        categoryId: item.categoryId || shelfLife.categoryId,
        location: shelfLife.suggestedLocation,
        quantity: item.quantity,
        unit: item.unit,
        purchaseDate: todayStr,
        expirationDate: calculateExpirationDate(todayStr, shelfLife.shelfLifeDays),
        consumed: false,
        notes: item.notes,
        addedBy: userName || item.addedBy,
      };
    });

    const nextPantry = [...newPantryItems, ...pantryItems];
    const nextShopping = shoppingItems.filter((item) => !item.isCompleted);

    setPantryItems(nextPantry);
    setShoppingItems(nextShopping);
    pushToServer(nextShopping, nextPantry, hashesRef.current);
    setActiveTab('pantry');
  };

  // Acciones de Despensa
  const addPantryItem = (item: Omit<PantryItem, 'id' | 'consumed'>) => {
    const newItem: PantryItem = {
      ...item,
      id: 'pantry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      consumed: false,
      addedBy: userName || undefined,
    };
    setPantryItems((prev) => {
      const next = [newItem, ...prev];
      pushToServer(shoppingRef.current, next, hashesRef.current);
      return next;
    });
  };

  const addPantryItemsFromReceipt = (
    items: ScannedReceiptItem[],
    receiptDate: string,
    storeName?: string,
    receiptHash?: string
  ) => {
    const selectedItems = items.filter((i) => i.selected);
    const dateToUse = receiptDate || new Date().toISOString().split('T')[0];

    const newPantryItems: PantryItem[] = selectedItems.map((item) => ({
      id: 'pantry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: item.normalizedName || item.rawName,
      categoryId: item.categoryId,
      location: item.suggestedLocation,
      quantity: item.quantity,
      unit: item.unit || 'szt',
      price: item.price,
      purchaseDate: dateToUse,
      expirationDate: calculateExpirationDate(dateToUse, item.estimatedShelfLifeDays),
      consumed: false,
      sourceReceiptStore: storeName,
      addedBy: userName || undefined,
    }));

    const nextHashes = receiptHash
      ? Array.from(new Set([...hashesRef.current, receiptHash.trim().toLowerCase()]))
      : hashesRef.current;

    if (receiptHash) {
      setRegisteredReceiptHashes(nextHashes);
    }

    setPantryItems((prev) => {
      const next = [...newPantryItems, ...prev];
      pushToServer(shoppingRef.current, next, nextHashes);
      return next;
    });
    setActiveTab('pantry');
  };

  const removePantryItem = (id: string) => {
    setPantryItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      pushToServer(shoppingRef.current, next, hashesRef.current);
      return next;
    });
  };

  const markPantryItemConsumed = (id: string) => {
    setPantryItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, consumed: true } : item));
      pushToServer(shoppingRef.current, next, hashesRef.current);
      return next;
    });
  };

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    setPantryItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      pushToServer(shoppingRef.current, next, hashesRef.current);
      return next;
    });
  };

  const readdPantryItemToShopping = (pantryItem: PantryItem) => {
    addShoppingItem({
      name: pantryItem.name,
      categoryId: pantryItem.categoryId,
      quantity: pantryItem.quantity,
      unit: pantryItem.unit,
      notes: `${t.restockNote}`,
    });
    setActiveTab('shopping');
  };

  // Estadísticas calculadas
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activePantry = pantryItems.filter((i) => !i.consumed);
  let pantryExpiringSoon = 0;
  let pantryExpired = 0;

  activePantry.forEach((item) => {
    const exp = new Date(item.expirationDate);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      pantryExpired++;
    } else if (diffDays <= 3) {
      pantryExpiringSoon++;
    }
  });

  const stats = {
    shoppingPending: shoppingItems.filter((i) => !i.isCompleted).length,
    shoppingCompleted: shoppingItems.filter((i) => i.isCompleted).length,
    pantryTotal: activePantry.length,
    pantryExpiringSoon,
    pantryExpired,
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        t,
        getCategoryName,
        showPrivacyModal,
        setShowPrivacyModal,
        householdCode,
        setHouseholdCode,
        userName,
        setUserName,
        syncStatus,
        connectedDevices,
        lastUpdatedBy,
        showShareModal,
        setShowShareModal,
        forceSyncNow,
        registeredReceiptHashes,
        checkReceiptDuplicate,
        shoppingItems,
        addShoppingItem,
        toggleShoppingItem,
        removeShoppingItem,
        clearCompletedShoppingItems,
        moveCompletedToPantry,
        pantryItems,
        addPantryItem,
        addPantryItemsFromReceipt,
        removePantryItem,
        markPantryItemConsumed,
        updatePantryItem,
        readdPantryItemToShopping,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

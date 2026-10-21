import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  Store, 
  AlertCircle, 
  PackageCheck, 
  Clock, 
  Refrigerator, 
  Snowflake, 
  Package, 
  Sparkles 
} from 'lucide-react';
import { ScannedReceiptResult, ScannedReceiptItem, StorageLocation } from '../types';
import { CATEGORIES, calculateExpirationDate } from '../data/shelfLifeRules';
import { useApp } from '../context/AppContext';

interface ReceiptReviewModalProps {
  receiptData: ScannedReceiptResult;
  onClose: () => void;
}

export const ReceiptReviewModal: React.FC<ReceiptReviewModalProps> = ({
  receiptData,
  onClose,
}) => {
  const { addPantryItemsFromReceipt, shoppingItems, toggleShoppingItem } = useApp();

  const [storeName, setStoreName] = useState(receiptData.storeName || 'Supermercado');
  const [receiptDate, setReceiptDate] = useState(receiptData.receiptDate || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<ScannedReceiptItem[]>(receiptData.items);
  const [syncWithShoppingList, setSyncWithShoppingList] = useState(true);

  // Toggle item selection
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateItem = (id: string, updates: Partial<ScannedReceiptItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const selectedCount = items.filter((i) => i.selected).length;

  const handleConfirmImport = () => {
    // 1. Añadir a despensa
    addPantryItemsFromReceipt(items, receiptDate, storeName);

    // 2. Si syncWithShoppingList está activo, marcar como completados en lista de compra si coinciden nombres
    if (syncWithShoppingList) {
      items.filter((i) => i.selected).forEach((scannedItem) => {
        const cleanName = scannedItem.normalizedName.toLowerCase();
        const match = shoppingItems.find(
          (s) => !s.isCompleted && (cleanName.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(cleanName))
        );
        if (match) {
          toggleShoppingItem(match.id);
        }
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 p-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl">
                  Revisar Productos del Ticket
                </h3>
                <p className="text-indigo-100 text-xs mt-0.5">
                  La IA ha detectado los productos y calculado sus plazos de conservación
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white font-bold p-2 text-sm rounded-xl hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* Metadata del Ticket (Supermercado & Fecha) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-white/70 block text-[10px]">Supermercado / Tienda:</span>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="bg-transparent font-bold text-white focus:outline-none border-b border-white/30 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-white/70 block text-[10px]">Fecha de Compra:</span>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="bg-transparent font-bold text-white focus:outline-none border-b border-white/30 w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Selección Rápida */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">
              {selectedCount} de {items.length} productos seleccionados
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectAll(true)}
                className="text-indigo-600 hover:underline font-semibold"
              >
                Marcar todos
              </button>
              <span>•</span>
              <button
                onClick={() => handleSelectAll(false)}
                className="text-slate-500 hover:underline"
              >
                Desmarcar todos
              </button>
            </div>
          </div>

          <label className="hidden sm:flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={syncWithShoppingList}
              onChange={(e) => setSyncWithShoppingList(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Marcar en mi lista de compra</span>
          </label>
        </div>

        {/* Lista de Productos Extraídos */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {items.map((item) => {
            const cat = CATEGORIES[item.categoryId] || CATEGORIES.otros;
            const expDate = calculateExpirationDate(receiptDate, item.estimatedShelfLifeDays);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between ${
                  item.selected
                    ? 'border-indigo-200 bg-indigo-50/20'
                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                {/* Checkbox y Nombre */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
                  />

                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={item.normalizedName}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { normalizedName: e.target.value })
                      }
                      className="font-bold text-slate-900 text-sm w-full bg-transparent focus:bg-white focus:px-2 py-0.5 rounded border-transparent focus:border-slate-300 border"
                    />
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Ticket: <code className="bg-slate-100 px-1 py-0.2 rounded text-slate-600">{item.rawName}</code></span>
                      {item.price && <span>• {item.price.toFixed(2)}€</span>}
                    </div>
                  </div>
                </div>

                {/* Controles de Caducidad y Categoría */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">
                  {/* Categoría Selector */}
                  <select
                    value={item.categoryId}
                    onChange={(e) => handleUpdateItem(item.id, { categoryId: e.target.value })}
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                  >
                    {Object.values(CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Ubicación */}
                  <select
                    value={item.suggestedLocation}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        suggestedLocation: e.target.value as StorageLocation,
                      })
                    }
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                  >
                    <option value="fridge">❄️ Nevera</option>
                    <option value="freezer">🧊 Congelador</option>
                    <option value="pantry">🧺 Despensa</option>
                  </select>

                  {/* Días estimados de caducidad */}
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={item.estimatedShelfLifeDays}
                      onChange={(e) =>
                        handleUpdateItem(item.id, {
                          estimatedShelfLifeDays: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="w-10 text-center font-bold text-slate-800 focus:outline-none"
                    />
                    <span className="text-slate-400">días</span>
                  </div>

                  {/* Preview de la fecha */}
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg hidden md:inline">
                    {expDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer y Acciones Finales */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>Los productos se añadirán a tu Despensa con alerta de caducidad activa.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={selectedCount === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Añadir {selectedCount} a Mi Despensa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Store,
  AlertCircle,
  PackageCheck,
  Clock,
  Sparkles,
  Trash2,
  Plus,
  ShieldAlert,
  Hash,
  FileCode2,
} from 'lucide-react';
import { ScannedReceiptResult, ScannedReceiptItem, StorageLocation } from '../types';
import { CATEGORIES, calculateExpirationDate, detectCategoryAndShelfLife } from '../data/shelfLifeRules';
import { generateReceiptHash } from '../services/ticket-parser';
import { useApp } from '../context/AppContext';

interface ReceiptReviewModalProps {
  receiptData: ScannedReceiptResult;
  onClose: () => void;
}

export const ReceiptReviewModal: React.FC<ReceiptReviewModalProps> = ({
  receiptData,
  onClose,
}) => {
  const {
    addPantryItemsFromReceipt,
    shoppingItems,
    toggleShoppingItem,
    checkReceiptDuplicate,
    householdCode,
  } = useApp();

  const [storeName, setStoreName] = useState(receiptData.storeName || 'Biedronka');
  const [nip, setNip] = useState(receiptData.nip || '');
  const [receiptDate, setReceiptDate] = useState(
    receiptData.receiptDate || new Date().toISOString().split('T')[0]
  );
  const [receiptTime, setReceiptTime] = useState(receiptData.receiptTime || '00:00');
  const [items, setItems] = useState<ScannedReceiptItem[]>(receiptData.items);
  const [syncWithShoppingList, setSyncWithShoppingList] = useState(true);
  const [receiptHash, setReceiptHash] = useState(receiptData.receiptHash || '');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isCheckingHash, setIsCheckingHash] = useState(true);
  const [showRawText, setShowRawText] = useState(false);

  // Calcular total dinámico en PLN a partir de los productos activos
  const calculatedTotal =
    Math.round(
      items
        .filter((i) => i.selected)
        .reduce((sum, item) => sum + (Number(item.price) || 0), 0) * 100
    ) / 100;

  const effectiveTotal =
    calculatedTotal > 0 ? calculatedTotal : Number(receiptData.totalAmount || 0);

  // Recalcular SHA-256(NIP + FECHA + HORA + TOTAL_PLN) y verificar deduplicación local/remota
  useEffect(() => {
    let active = true;
    (async () => {
      setIsCheckingHash(true);
      const hash = await generateReceiptHash({
        nip,
        fecha: receiptDate,
        hora: receiptTime,
        total: effectiveTotal,
      });
      if (!active) return;
      setReceiptHash(hash);

      const dup = await checkReceiptDuplicate(hash);
      if (!active) return;
      setIsDuplicate(dup);
      setIsCheckingHash(false);
    })();

    return () => {
      active = false;
    };
  }, [nip, receiptDate, receiptTime, effectiveTotal, checkReceiptDuplicate]);

  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateItem = (id: string, updates: Partial<ScannedReceiptItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if (updates.normalizedName !== undefined) {
          const detected = detectCategoryAndShelfLife(updates.normalizedName);
          if (detected.categoryId !== 'otros') {
            updated.categoryId = detected.categoryId;
            updated.suggestedLocation = detected.suggestedLocation;
            updated.estimatedShelfLifeDays = detected.shelfLifeDays;
          }
        }
        return updated;
      })
    );
  };

  // Eliminar un elemento leído erróneamente (ruido del papel)
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Añadir fila manual en caso de línea no legible en el papel térmico
  const handleAddEmptyItem = () => {
    const newItem: ScannedReceiptItem = {
      id: `manual-${Date.now()}`,
      rawName: 'Manual',
      normalizedName: 'Nuevo producto',
      categoryId: 'otros',
      quantity: 1,
      unit: 'szt',
      price: 0,
      suggestedLocation: 'pantry',
      estimatedShelfLifeDays: 14,
      selected: true,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const selectedCount = items.filter((i) => i.selected).length;

  const handleConfirmImport = async () => {
    if (selectedCount === 0) return;

    // Verificación final contra base de datos local y remota antes de persistir
    const duplicateNow = await checkReceiptDuplicate(receiptHash);
    if (duplicateNow) {
      setIsDuplicate(true);
      return;
    }

    // 1. Añadir a despensa y registrar hash SHA-256 en el hogar compartido
    addPantryItemsFromReceipt(items, receiptDate, storeName, receiptHash);

    // 2. Si syncWithShoppingList está activo, marcar como completados en lista de compra si coinciden nombres
    if (syncWithShoppingList) {
      items
        .filter((i) => i.selected)
        .forEach((scannedItem) => {
          const cleanName = scannedItem.normalizedName.toLowerCase();
          const match = shoppingItems.find(
            (s) =>
              !s.isCompleted &&
              (cleanName.includes(s.name.toLowerCase()) ||
                s.name.toLowerCase().includes(cleanName))
          );
          if (match) {
            toggleShoppingItem(match.id);
          }
        });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 p-4 sm:p-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <h3 className="font-extrabold text-base sm:text-xl">
                  Verificación de Ticket Polaco (Paragon Fiskalny)
                </h3>
                <p className="text-indigo-100 text-xs mt-0.5">
                  Revisa, edita o elimina líneas ruidosas antes de sincronizar con el hogar{' '}
                  <strong>{householdCode}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white font-bold p-2 text-sm rounded-xl hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Metadata Fiscal del Ticket (Tienda, NIP, Fecha, Hora, Total PLN) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white/70 block text-[10px]">Tienda (Sklep):</span>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="bg-transparent font-bold text-white focus:outline-none border-b border-white/30 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white/70 block text-[10px]">NIP Fiscal:</span>
                <input
                  type="text"
                  value={nip}
                  placeholder="Sin NIP"
                  onChange={(e) => setNip(e.target.value)}
                  className="bg-transparent font-mono font-bold text-white placeholder-white/40 focus:outline-none border-b border-white/30 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white/70 block text-[10px]">Fecha Compra:</span>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="bg-transparent font-bold text-white focus:outline-none border-b border-white/30 w-full cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white/70 block text-[10px]">Hora / Total PLN:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={receiptTime}
                    onChange={(e) => setReceiptTime(e.target.value)}
                    className="bg-transparent font-mono font-bold text-white focus:outline-none border-b border-white/30 w-12"
                  />
                  <span className="font-extrabold text-amber-300 whitespace-nowrap">
                    {effectiveTotal.toFixed(2)} zł
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Deduplicación SHA-256 */}
        {isDuplicate && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-3 flex items-center gap-3 text-rose-800 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div className="flex-1">
              <strong className="font-extrabold block text-rose-900">
                ¡Ticket Duplicado Detectado! (Prevención de Doble Registro)
              </strong>
              <span>
                El hash único de este ticket (<code>{receiptHash.slice(0, 16)}...</code>) ya fue
                registrado previamente en la despensa del hogar por ti o por tu pareja.
              </span>
            </div>
          </div>
        )}

        {/* Barra de Selección Rápida y Controles */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-800">
              {selectedCount} de {items.length} productos activos
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Marcar todos
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-slate-500 hover:underline cursor-pointer"
              >
                Desmarcar todos
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddEmptyItem}
              className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir fila</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {receiptData.rawTextPreview && (
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>{showRawText ? 'Ocultar OCR bruto' : 'Ver texto OCR'}</span>
              </button>
            )}

            <label className="hidden sm:flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={syncWithShoppingList}
                onChange={(e) => setSyncWithShoppingList(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Tachar de la lista de compra</span>
            </label>
          </div>
        </div>

        {/* Vista opcional del texto bruto extraído por el OCR */}
        {showRawText && receiptData.rawTextPreview && (
          <div className="px-5 py-3 bg-slate-900 text-emerald-400 font-mono text-[11px] max-h-36 overflow-y-auto border-b border-slate-800 whitespace-pre-wrap">
            {receiptData.rawTextPreview}
          </div>
        )}

        {/* Lista de Productos Extraídos con Edición en Línea */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
              <p className="font-bold text-slate-700 text-sm">
                No se detectaron líneas con formato de precio fiscal polaco automáticamente.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Asegúrate de que la foto del paragon fiskalny esté bien enfocada e incluya la columna derecha de precios, o añade los productos manualmente abajo.
              </p>
              <button
                type="button"
                onClick={handleAddEmptyItem}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Producto Manualmente</span>
              </button>
            </div>
          ) : (
            items.map((item) => {
              const expDate = calculateExpirationDate(receiptDate, item.estimatedShelfLifeDays);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between ${
                    item.selected
                      ? 'border-indigo-200 bg-indigo-50/15'
                      : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  {/* Checkbox + Nombre Editable */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
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
                        placeholder="Nombre del producto"
                        className="font-bold text-slate-900 text-sm w-full bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 truncate">
                        <span>
                          OCR: <code className="bg-slate-100 px-1 rounded text-slate-600">{item.rawName}</code>
                        </span>
                        <span>• Vence: {expDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campos Editables en Línea: Cantidad, Precio (PLN), Categoría, Ubicación, Caducidad y Eliminar */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                    {/* Cantidad Editable */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
                      <span className="text-[10px] text-slate-400 mr-1">Cant:</span>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, {
                            quantity: Math.max(0.1, parseFloat(e.target.value) || 1),
                          })
                        }
                        className="w-12 text-center font-bold text-slate-800 focus:outline-none"
                      />
                    </div>

                    {/* Precio Editable (PLN) */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price ?? 0}
                        onChange={(e) =>
                          handleUpdateItem(item.id, {
                            price: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-16 text-right font-bold text-emerald-700 focus:outline-none"
                      />
                      <span className="text-[10px] font-bold text-slate-400 ml-1">zł</span>
                    </div>

                    {/* Categoría */}
                    <select
                      value={item.categoryId}
                      onChange={(e) => handleUpdateItem(item.id, { categoryId: e.target.value })}
                      className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 max-w-[130px]"
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

                    {/* Días de caducidad */}
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
                      <span className="text-slate-400 text-[10px]">d</span>
                    </div>

                    {/* Botón Eliminar Elemento Leído Erróneamente */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                      title="Eliminar línea o ruido del papel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer y Botón de Confirmación */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>
              Hash SHA-256: <code className="font-mono text-slate-700">{receiptHash.slice(0, 14)}...</code>
              {receiptData.processingTimeMs ? ` • Procesado en ${receiptData.processingTimeMs} ms` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={selectedCount === 0 || isDuplicate || isCheckingHash}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>
                {isDuplicate
                  ? 'Ticket ya registrado en el hogar'
                  : `Confirmar e integrar a la despensa del hogar (${selectedCount})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

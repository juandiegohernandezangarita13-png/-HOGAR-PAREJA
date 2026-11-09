import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Search, 
  PackageCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_LIST, detectCategoryAndShelfLife } from '../data/shelfLifeRules';

export const ShoppingList: React.FC = () => {
  const {
    shoppingItems,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCompletedShoppingItems,
    moveCompletedToPantry,
    t,
    getCategoryName,
    language,
  } = useApp();

  const [inputName, setInputName] = useState('');
  const [inputCategory, setInputCategory] = useState<string>('');
  const [inputQuantity, setInputQuantity] = useState(1);
  const [inputUnit, setInputUnit] = useState(language === 'pl' ? 'szt' : 'ud');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Auto-detectar categoría al escribir
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputName(val);
    if (!inputCategory || inputCategory === 'otros') {
      const detected = detectCategoryAndShelfLife(val);
      if (detected.categoryId !== 'otros') {
        setInputCategory(detected.categoryId);
      }
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const detected = detectCategoryAndShelfLife(inputName);
    const finalCategory = inputCategory || detected.categoryId;

    addShoppingItem({
      name: inputName.trim(),
      categoryId: finalCategory,
      quantity: inputQuantity || 1,
      unit: inputUnit,
    });

    setInputName('');
    setInputCategory('');
    setInputQuantity(1);
  };

  // Filtrado
  const filteredItems = shoppingItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedFilterCategory === 'all' || item.categoryId === selectedFilterCategory;
    return matchesSearch && matchesCat;
  });

  const pendingItems = filteredItems.filter((i) => !i.isCompleted);
  const completedItems = filteredItems.filter((i) => i.isCompleted);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>{t.shoppingTitle}</span>
          </h2>
          <p className="text-emerald-100 text-sm mt-0.5">
            {pendingItems.length} {t.shoppingPendingCount} • {completedItems.length} {t.shoppingCompletedCount}
          </p>
        </div>

        {completedItems.length > 0 && (
          <button
            onClick={moveCompletedToPantry}
            className="flex items-center gap-2 bg-white text-emerald-800 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-emerald-50 transition transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
          >
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.moveToPantryBtn} ({completedItems.length})</span>
            <ArrowRight className="w-4 h-4 text-emerald-500" />
          </button>
        )}
      </div>

      {/* Formulario rápido para añadir producto */}
      <form
        onSubmit={handleAddItem}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputName}
              onChange={handleNameChange}
              placeholder={t.addItemPlaceholder}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              autoFocus
            />
            {inputCategory && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {getCategoryName(inputCategory)}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {/* Categoría Selector */}
            <select
              value={inputCategory}
              onChange={(e) => setInputCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[150px]"
            >
              <option value="">{t.categoryAuto}</option>
              {CATEGORY_LIST.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryName(cat.id)}
                </option>
              ))}
            </select>

            {/* Cantidad */}
            <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 px-2">
              <input
                type="number"
                min="1"
                max="99"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 text-center bg-transparent py-2 text-sm font-semibold text-slate-800 focus:outline-none"
              />
              <select
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value)}
                className="bg-transparent text-xs text-slate-500 border-none focus:outline-none pr-1"
              >
                <option value="szt">szt</option>
                <option value="ud">ud</option>
                <option value="kg">kg</option>
                <option value="l">l</option>
                <option value="op">op/pack</option>
              </select>
            </div>

            {/* Botón Añadir */}
            <button
              type="submit"
              disabled={!inputName.trim()}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addBtn}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        {/* Barra de Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Categorías Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedFilterCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.filterAll} ({shoppingItems.length})
          </button>
          {CATEGORY_LIST.filter(c => shoppingItems.some(i => i.categoryId === c.id)).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                selectedFilterCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{getCategoryName(cat.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Artículos Pendientes */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          {t.toBuyHeader} ({pendingItems.length})
        </h3>

        {pendingItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
            <span className="text-4xl">🎉</span>
            <p className="font-semibold text-slate-700 mt-2">{t.emptyShoppingTitle}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.emptyShoppingSubtitle}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingItems.map((item) => {
              const cat = CATEGORIES[item.categoryId] || CATEGORIES.otros;
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:border-slate-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleShoppingItem(item.id)}
                      className="w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition flex-shrink-0 cursor-pointer"
                      title={t.shoppingCompletedCount}
                    >
                      <Check className="w-4 h-4 text-transparent hover:text-emerald-500" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm truncate">
                          {item.name}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
                        >
                          {getCategoryName(item.categoryId)}
                        </span>
                        {item.addedBy && (
                          <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full">
                            ❤️ {item.addedBy}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                      {item.quantity} {item.unit}
                    </span>

                    <button
                      onClick={() => removeShoppingItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title={t.deleteItem}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Artículos Completados (Carrito) */}
      {completedItems.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>{t.inCartHeader} ({completedItems.length})</span>
            </h3>
            <button
              onClick={clearCompletedShoppingItems}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition cursor-pointer"
            >
              {t.clearCompleted}
            </button>
          </div>

          <div className="space-y-2 opacity-80">
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3 text-slate-500"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className="w-6 h-6 rounded-lg bg-emerald-500 border border-emerald-600 flex items-center justify-center text-white flex-shrink-0 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <span className="line-through text-slate-500 text-sm font-medium truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={() => removeShoppingItem(item.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

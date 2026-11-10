import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Search, 
  Snowflake, 
  Refrigerator, 
  ShoppingBag,
  LayoutGrid,
  List,
  ArrowLeft,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getExpirationStatus, calculateExpirationDate } from '../data/shelfLifeRules';
import { StorageLocation, ExpirationStatus, PantryItem } from '../types';

const CATEGORY_EMOJIS: Record<string, string> = {
  frutas_verduras: '🍏',
  carnes_aves: '🥩',
  pescados_mariscos: '🐟',
  lacteos_huevos: '🥛',
  embutidos_quesos: '🧀',
  panaderia_pasteleria: '🥖',
  despensa_conservas: '🥫',
  congelados: '🧊',
  bebidas: '🧃',
  limpieza_hogar: '🧼',
  otros: '🏷️',
};

export const PantryView: React.FC = () => {
  const { 
    pantryItems, 
    markPantryItemConsumed, 
    removePantryItem, 
    readdPantryItemToShopping,
    addPantryItem,
    stats,
    t,
    getCategoryName,
    language,
  } = useApp();

  // Modo de visualización: 'gallery' (por categorías visuales) o 'list' (lista plana)
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Filtros de Ubicación y Estado de Caducidad (se mantienen intactos según pedido)
  const [locationFilter, setLocationFilter] = useState<'all' | StorageLocation>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpirationStatus>('all');

  // Buscador instantáneo para encontrar cualquier alimento (ej: arveja, maíz, leche...)
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Manual Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('frutas_verduras');
  const [newLocation, setNewLocation] = useState<StorageLocation>('fridge');
  const [newDays, setNewDays] = useState(5);
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState(language === 'pl' ? 'szt' : 'ud');

  // Filtrar activos (no consumidos)
  const activeItems = pantryItems.filter((i) => !i.consumed);

  // Filtrado según ubicación y estado
  const baseFilteredItems = activeItems.filter((item) => {
    const matchesLoc = locationFilter === 'all' || item.location === locationFilter;
    const { status } = getExpirationStatus(item.expirationDate);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesLoc && matchesStatus;
  });

  // Si hay búsqueda activa, filtrar por texto en toda la despensa
  const isSearching = searchQuery.trim().length > 0;
  const searchNormalized = searchQuery.trim().toLowerCase();

  const searchFilteredItems = baseFilteredItems.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(searchNormalized);
    const catNameMatch = getCategoryName(item.categoryId).toLowerCase().includes(searchNormalized);
    const storeMatch = item.sourceReceiptStore?.toLowerCase().includes(searchNormalized);
    return nameMatch || catNameMatch || storeMatch;
  });

  // Si se seleccionó una categoría específica en la galería
  const categoryScopedItems = selectedCategoryId
    ? baseFilteredItems.filter((item) => item.categoryId === selectedCategoryId)
    : baseFilteredItems;

  // Lista final a renderizar
  const displayedItems = isSearching
    ? searchFilteredItems
    : selectedCategoryId
    ? categoryScopedItems
    : baseFilteredItems;

  // Ordenar por caducidad (urgentes primero)
  const sortedItems = [...displayedItems].sort((a, b) => {
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const expDate = calculateExpirationDate(todayStr, newDays);

    addPantryItem({
      name: newTitle.trim(),
      categoryId: newCategory,
      location: newLocation,
      quantity: newQuantity,
      unit: newUnit,
      purchaseDate: todayStr,
      expirationDate: expDate,
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  const getLocalizedExpLabel = (expDate: string) => {
    const { status, daysRemaining } = getExpirationStatus(expDate);
    if (status === 'expired') {
      return {
        status,
        label: t.expiredDaysAgo.replace('{DAYS}', String(Math.abs(daysRemaining))),
      };
    } else if (daysRemaining === 0) {
      return {
        status,
        label: t.expiresToday,
      };
    } else if (daysRemaining <= 3) {
      return {
        status,
        label: t.expiresInDays.replace('{DAYS}', String(daysRemaining)),
      };
    } else {
      return {
        status,
        label: t.goodForDays.replace('{DAYS}', String(daysRemaining)),
      };
    }
  };

  const getLocationBadge = (loc: StorageLocation) => {
    switch (loc) {
      case 'fridge':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200">
            <Refrigerator className="w-3 h-3 text-sky-500" />
            {t.locationFridge}
          </span>
        );
      case 'freezer':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
            <Snowflake className="w-3 h-3 text-indigo-500" />
            {t.locationFreezer}
          </span>
        );
      case 'pantry':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
            <Package className="w-3 h-3 text-amber-500" />
            {t.locationPantry}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Alerta de Caducidad Crítica */}
      {(stats.pantryExpired > 0 || stats.pantryExpiringSoon > 0) && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-rose-900/10 flex items-start gap-4">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base sm:text-lg">{t.pantryUrgentBannerTitle}</h3>
            <p className="text-white/90 text-sm mt-0.5">
              {t.pantryUrgentBannerText}
            </p>
          </div>
          <button
            onClick={() => {
              setStatusFilter(stats.pantryExpired > 0 ? 'expired' : 'warning');
              setSelectedCategoryId(null);
            }}
            className="hidden sm:inline-flex bg-white text-rose-700 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-rose-50 transition cursor-pointer"
          >
            {t.viewUrgentBtn}
          </button>
        </div>
      )}

      {/* 2. Cabecera con Botón de Añadir */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t.pantryTitle}</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              {activeItems.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t.pantrySubtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedCategoryId) {
              setNewCategory(selectedCategoryId);
            }
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addToPantryBtn}</span>
        </button>
      </div>

      {/* 3. Filtros de Ubicación y Estado (Mantenidos intactos según solicitud) */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Filtros Ubicación */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            {t.locationLabel}
          </span>
          <button
            onClick={() => setLocationFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              locationFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.locationAll} ({activeItems.length})
          </button>
          <button
            onClick={() => setLocationFilter('fridge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              locationFilter === 'fridge'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Refrigerator className="w-3.5 h-3.5" />
            {t.locationFridge} ({activeItems.filter((i) => i.location === 'fridge').length})
          </button>
          <button
            onClick={() => setLocationFilter('freezer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              locationFilter === 'freezer'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            {t.locationFreezer} ({activeItems.filter((i) => i.location === 'freezer').length})
          </button>
          <button
            onClick={() => setLocationFilter('pantry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              locationFilter === 'pantry'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            {t.locationPantry} ({activeItems.filter((i) => i.location === 'pantry').length})
          </button>
        </div>

        {/* Filtros Estado de Caducidad */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            {t.statusLabel}
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.statusAll}
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-rose-600 text-white'
                : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            {t.statusExpired} ({stats.pantryExpired})
          </button>
          <button
            onClick={() => setStatusFilter('warning')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              statusFilter === 'warning'
                ? 'bg-amber-500 text-white'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            {t.statusWarning} ({stats.pantryExpiringSoon})
          </button>
          <button
            onClick={() => setStatusFilter('good')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              statusFilter === 'good'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            {t.statusGood}
          </button>
        </div>
      </div>

      {/* 4. Barra de Búsqueda Dedicada y Selector de Modo (Galería / Lista) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Buscador Rápido (Encuentra instantáneamente si hay arveja, maíz, carne, etc.) */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'pl'
                ? 'Szukaj w spiżarni (np. groszek, kukurydza, mleko, ryż...)'
                : language === 'en'
                ? 'Search pantry (e.g. peas, corn, milk, rice...)'
                : 'Buscar en la despensa (ej: arveja, maíz, pollo, leche...)'
            }
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
              title={t.pantryClearSearch}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selector de Vista: Galería por Categorías vs Lista Completa */}
        {!isSearching && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => {
                setViewMode('gallery');
                setSelectedCategoryId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'gallery'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title={t.pantryViewModeGallery}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.pantryViewModeGallery}</span>
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedCategoryId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title={t.pantryViewModeList}
            >
              <List className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.pantryViewModeList}</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. VISTA DE RESULTADOS DE BÚSQUEDA (Si el usuario escribió algo en el buscador) */}
      {isSearching && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-medium">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>
                {t.pantrySearchResultsCount.replace('{COUNT}', String(searchFilteredItems.length))} &ldquo;
                <strong className="font-bold">{searchQuery}</strong>&rdquo;
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              {t.pantryClearSearch}
            </button>
          </div>

          {searchFilteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
              <span className="text-4xl">🔍</span>
              <p className="font-semibold text-slate-800 mt-2">
                {language === 'pl'
                  ? `Brak artykułów dla "${searchQuery}"`
                  : language === 'en'
                  ? `No items found matching "${searchQuery}"`
                  : `No se encontró ningún artículo para "${searchQuery}"`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'pl'
                  ? 'Sprawdź pisownię lub dodaj artykuł do spiżarni.'
                  : language === 'en'
                  ? 'Check spelling or add it manually to your pantry.'
                  : 'Prueba con otra palabra o añade el producto a la despensa.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedItems.map((item) => renderPantryItemCard(item))}
            </div>
          )}
        </div>
      )}

      {/* 6. VISTA DE GALERÍA POR CATEGORÍAS (Recuadros interactivos solicitados) */}
      {!isSearching && viewMode === 'gallery' && !selectedCategoryId && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t.pantryGallerySectionTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.pantryGallerySectionSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.values(CATEGORIES).map((cat) => {
              // Calcular artículos de esta categoría que cumplen los filtros de ubicación/estado
              const categoryItems = baseFilteredItems.filter((i) => i.categoryId === cat.id);
              const count = categoryItems.length;

              // Revisar si hay alguno por vencer o vencido en esta categoría para avisar en la tarjeta
              const hasExpired = categoryItems.some((i) => {
                const { status } = getExpirationStatus(i.expirationDate);
                return status === 'expired';
              });
              const hasWarning = categoryItems.some((i) => {
                const { status } = getExpirationStatus(i.expirationDate);
                return status === 'warning';
              });

              const emoji = CATEGORY_EMOJIS[cat.id] || '📦';
              const localizedName = getCategoryName(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] ${
                    count > 0
                      ? 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                      : 'bg-slate-50/50 border-slate-200/60 opacity-70 hover:opacity-100 hover:bg-white'
                  }`}
                >
                  {/* Indicador de caducidad en el recuadro */}
                  {hasExpired && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  )}
                  {hasExpired && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-600" />
                  )}
                  {!hasExpired && hasWarning && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-500" />
                  )}

                  {/* Icono / Emoji y Nombre */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform">
                        {emoji}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-700 transition">
                      {localizedName}
                    </h4>
                  </div>

                  {/* Contador de artículos */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        count > 0 ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {count > 0
                        ? t.pantryItemsCountLabel.replace('{COUNT}', String(count))
                        : language === 'pl'
                        ? 'Pusto'
                        : language === 'en'
                        ? 'Empty'
                        : 'Vacío'}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {categoryItems.filter((i) => i.location === 'fridge').length > 0 && '❄️'}
                        {categoryItems.filter((i) => i.location === 'freezer').length > 0 && '🧊'}
                        {categoryItems.filter((i) => i.location === 'pantry').length > 0 && '🧺'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. DETALLE DE CATEGORÍA SELECCIONADA EN MODO GALERÍA */}
      {!isSearching && viewMode === 'gallery' && selectedCategoryId && (
        <div className="space-y-4 animate-fadeIn">
          {/* Barra de navegación superior con botón Volver */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.pantryBackToCategories}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_EMOJIS[selectedCategoryId] || '📦'}</span>
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {getCategoryName(selectedCategoryId)}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {categoryScopedItems.length}
              </span>
            </div>

            <button
              onClick={() => {
                setNewCategory(selectedCategoryId);
                setShowAddModal(true);
              }}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addToPantryBtn}</span>
            </button>
          </div>

          {/* Lista de productos dentro de esta categoría */}
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
              <span className="text-4xl">{CATEGORY_EMOJIS[selectedCategoryId] || '🧺'}</span>
              <p className="font-semibold text-slate-700 mt-2">{t.pantryItemsEmptyCategory}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.emptyPantrySubtitle}
              </p>
              <button
                onClick={() => {
                  setNewCategory(selectedCategoryId);
                  setShowAddModal(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addToPantryBtn}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedItems.map((item) => renderPantryItemCard(item))}
            </div>
          )}
        </div>
      )}

      {/* 8. VISTA DE LISTA COMPLETA TRADICIONAL (Para ver todos los artículos de golpe) */}
      {!isSearching && viewMode === 'list' && (
        <div className="space-y-3 animate-fadeIn">
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
              <span className="text-4xl">🧺</span>
              <p className="font-semibold text-slate-700 mt-2">{t.emptyPantryTitle}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.emptyPantrySubtitle}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedItems.map((item) => renderPantryItemCard(item))}
            </div>
          )}
        </div>
      )}

      {/* Modal Manual de Añadir Artículo a la Despensa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>{t.manualModalTitle}</span>
            </h3>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.productNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ej: Arveja verde, Maíz dulce, Leche fresca..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    {Object.values(CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {CATEGORY_EMOJIS[c.id] || '📦'} {getCategoryName(c.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.locationLabel}
                  </label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value as StorageLocation)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="fridge">❄️ {t.locationFridge}</option>
                    <option value="freezer">🧊 {t.locationFreezer}</option>
                    <option value="pantry">🧺 {t.locationPantry}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.qtyUnit}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidad
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.shelfLifeDaysLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDays}
                    onChange={(e) => setNewDays(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs text-center font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  {t.saveToPantryBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Renderiza una tarjeta individual de producto en la despensa
   */
  function renderPantryItemCard(item: PantryItem) {
    const cat = CATEGORIES[item.categoryId] || CATEGORIES.otros;
    const exp = getLocalizedExpLabel(item.expirationDate);
    const emoji = CATEGORY_EMOJIS[item.categoryId] || '📦';

    let cardBorder = 'border-slate-200 hover:border-slate-300';
    let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';

    if (exp.status === 'expired') {
      cardBorder = 'border-rose-300 bg-rose-50/20';
      badgeBg = 'bg-rose-600 text-white font-bold animate-pulse';
    } else if (exp.status === 'warning') {
      cardBorder = 'border-amber-300 bg-amber-50/20';
      badgeBg = 'bg-amber-500 text-white font-bold';
    }

    return (
      <div
        key={item.id}
        className={`bg-white rounded-2xl p-4 border shadow-sm transition flex flex-col justify-between gap-3 ${cardBorder}`}
      >
        <div>
          {/* Fila superior: Categoría, Ubicación y Badge Caducidad */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
              >
                <span>{emoji}</span>
                <span>{getCategoryName(item.categoryId)}</span>
              </span>
              {getLocationBadge(item.location)}
            </div>

            <span
              className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${badgeBg}`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{exp.label}</span>
            </span>
          </div>

          {/* Nombre del Producto y Cantidad */}
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-bold text-slate-900 text-base leading-snug">
              {item.name}
            </h4>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
              {item.quantity} {item.unit}
            </span>
          </div>

          {/* Fechas de compra y caducidad */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.boughtOn} {item.purchaseDate}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">{t.limitDate} {item.expirationDate}</span>
            </div>
          </div>

          {item.sourceReceiptStore && (
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              🛒 {item.sourceReceiptStore}
            </p>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => markPantryItemConsumed(item.id)}
              className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.actionConsumed}</span>
            </button>

            <button
              onClick={() => readdPantryItemToShopping(item)}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 font-semibold px-2 py-1.5 rounded-xl transition cursor-pointer"
              title="Añadir a la lista de compras"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.actionRestock}</span>
            </button>
          </div>

          <button
            onClick={() => removePantryItem(item.id)}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
            title={t.deleteItem}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
};

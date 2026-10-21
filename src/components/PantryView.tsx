import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Search, 
  Snowflake, 
  Refrigerator, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getExpirationStatus, calculateExpirationDate } from '../data/shelfLifeRules';
import { StorageLocation, ExpirationStatus } from '../types';

export const PantryView: React.FC = () => {
  const { 
    pantryItems, 
    markPantryItemConsumed, 
    removePantryItem, 
    readdPantryItemToShopping,
    addPantryItem,
    stats 
  } = useApp();

  const [locationFilter, setLocationFilter] = useState<'all' | StorageLocation>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpirationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Manual Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('frutas_verduras');
  const [newLocation, setNewLocation] = useState<StorageLocation>('fridge');
  const [newDays, setNewDays] = useState(5);
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState('ud');

  // Filtrar activos (no consumidos)
  const activeItems = pantryItems.filter((i) => !i.consumed);

  // Filtros aplicados
  const filteredItems = activeItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoc = locationFilter === 'all' || item.location === locationFilter;
    
    const { status } = getExpirationStatus(item.expirationDate);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesLoc && matchesStatus;
  });

  // Ordenar por caducidad (los más urgentes primero)
  const sortedItems = [...filteredItems].sort((a, b) => {
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

  const getLocationBadge = (loc: StorageLocation) => {
    switch (loc) {
      case 'fridge':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200">
            <Refrigerator className="w-3 h-3 text-sky-500" />
            Nevera
          </span>
        );
      case 'freezer':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
            <Snowflake className="w-3 h-3 text-indigo-500" />
            Congelador
          </span>
        );
      case 'pantry':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
            <Package className="w-3 h-3 text-amber-500" />
            Despensa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Caducidad Crítica */}
      {(stats.pantryExpired > 0 || stats.pantryExpiringSoon > 0) && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-rose-900/10 flex items-start gap-4">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base sm:text-lg">Atención a tus Caducidades</h3>
            <p className="text-white/90 text-sm mt-0.5">
              Tienes {stats.pantryExpired > 0 && <span className="font-extrabold underline">{stats.pantryExpired} producto(s) ya caducado(s)</span>}
              {stats.pantryExpired > 0 && stats.pantryExpiringSoon > 0 && ' y '}
              {stats.pantryExpiringSoon > 0 && <span className="font-extrabold underline">{stats.pantryExpiringSoon} por vencer en menos de 3 días</span>}.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter(stats.pantryExpired > 0 ? 'expired' : 'warning')}
            className="hidden sm:inline-flex bg-white text-rose-700 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-rose-50 transition cursor-pointer"
          >
            Ver Urgentes
          </button>
        </div>
      )}

      {/* Cabecera con Botón de Añadir */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📦 Mi Despensa & Nevera</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              {activeItems.length} artículos
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Control de conservación, fechas de consumo y avisos de caducidad
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir a Despensa</span>
        </button>
      </div>

      {/* Filtros de Ubicación y Estado */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Filtros Ubicación */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Ubicación:
          </span>
          <button
            onClick={() => setLocationFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              locationFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({activeItems.length})
          </button>
          <button
            onClick={() => setLocationFilter('fridge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              locationFilter === 'fridge'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Refrigerator className="w-3.5 h-3.5" />
            Nevera ({activeItems.filter((i) => i.location === 'fridge').length})
          </button>
          <button
            onClick={() => setLocationFilter('freezer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              locationFilter === 'freezer'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            Congelador ({activeItems.filter((i) => i.location === 'freezer').length})
          </button>
          <button
            onClick={() => setLocationFilter('pantry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              locationFilter === 'pantry'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Despensa ({activeItems.filter((i) => i.location === 'pantry').length})
          </button>
        </div>

        {/* Filtros Estado de Caducidad & Búsqueda */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Estado:
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'all'
                  ? 'bg-slate-200 text-slate-800'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                statusFilter === 'expired'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              🔴 Caducados ({stats.pantryExpired})
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                statusFilter === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              🟡 Por vencer ({stats.pantryExpiringSoon})
            </button>
            <button
              onClick={() => setStatusFilter('good')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                statusFilter === 'good'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              🟢 Buenos
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en despensa..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Grid de Productos en Despensa */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <span className="text-4xl">🧺</span>
          <p className="font-semibold text-slate-700 mt-2">No hay artículos con estos filtros</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Añade productos manualmente o escanea un ticket de compra.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedItems.map((item) => {
            const cat = CATEGORIES[item.categoryId] || CATEGORIES.otros;
            const exp = getExpirationStatus(item.expirationDate);

            // Estilos de semáforo
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
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
                      >
                        {cat.name}
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
                      <span>Comprado: {item.purchaseDate}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Límite: {item.expirationDate}</span>
                    </div>
                  </div>

                  {item.sourceReceiptStore && (
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">
                      🛒 Ticket: {item.sourceReceiptStore}
                    </p>
                  )}
                </div>

                {/* Acciones Rápidas */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markPantryItemConsumed(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition cursor-pointer"
                      title="Marcar como consumido"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Consumido</span>
                    </button>

                    <button
                      onClick={() => readdPantryItemToShopping(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition cursor-pointer"
                      title="Volver a añadir a la lista de compra"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Reponer</span>
                    </button>
                  </div>

                  <button
                    onClick={() => removePantryItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    title="Eliminar de la despensa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Manual de Añadir a Despensa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Añadir a la Despensa</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ej: Merluza fresca, Tomates..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {Object.values(CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ubicación</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value as StorageLocation)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="fridge">❄️ Nevera</option>
                    <option value="freezer">🧊 Congelador</option>
                    <option value="pantry">🧺 Despensa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Cantidad y Unidad
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="1"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-2 rounded-xl border border-slate-300 text-sm text-center"
                    />
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="flex-1 px-2 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="ud">ud</option>
                      <option value="kg">kg</option>
                      <option value="l">l</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Caducidad (Días de vida)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDays}
                    onChange={(e) => setNewDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Guardar en Despensa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

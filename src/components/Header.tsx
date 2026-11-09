import React from 'react';
import { ShoppingCart, Package, ScanLine, AlertTriangle, Heart, Users, Globe, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../i18n/translations';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    syncStatus,
    connectedDevices,
    householdCode,
    setShowShareModal,
    setShowPrivacyModal,
    language,
    setLanguage,
    t,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo / Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-xl flex-shrink-0">
              🛒
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  Compr<span className="text-emerald-600">AI</span>
                </h1>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer"
                  title={t.shareModalTitle}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-500 animate-pulse'
                        : syncStatus === 'connecting'
                        ? 'bg-amber-400'
                        : 'bg-slate-400'
                    }`}
                  />
                  <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                  <span className="truncate max-w-[85px] sm:max-w-none">{householdCode}</span>
                  {connectedDevices > 1 && (
                    <span className="bg-emerald-600 text-white px-1 rounded-full text-[9px]">
                      {connectedDevices}
                    </span>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Controls & Navigation Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {/* Selector manual de idioma (PL / ES / EN) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <button
                onClick={() => setLanguage('pl')}
                className={`px-1.5 py-1 rounded-lg transition cursor-pointer ${
                  language === 'pl' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Język polski"
              >
                🇵🇱 PL
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-1.5 py-1 rounded-lg transition cursor-pointer ${
                  language === 'es' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Español"
              >
                🇪🇸 ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-1 rounded-lg transition cursor-pointer ${
                  language === 'en' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="English"
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Botón Pareja / Móvil */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
              title={t.shareModalTitle}
            >
              <Users className="w-4 h-4 text-rose-600" />
              <span className="hidden md:inline">{t.coupleMobile}</span>
            </button>

            {/* Tab Lista de Compra */}
            <button
              onClick={() => setActiveTab('shopping')}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'shopping'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabShopping}</span>
              {stats.shoppingPending > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'shopping'
                      ? 'bg-white text-emerald-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {stats.shoppingPending}
                </span>
              )}
            </button>

            {/* Tab Despensa & Caducidades */}
            <button
              onClick={() => setActiveTab('pantry')}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'pantry'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabPantry}</span>
              {stats.pantryExpired > 0 || stats.pantryExpiringSoon > 0 ? (
                <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.pantryExpired + stats.pantryExpiringSoon}
                </span>
              ) : (
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'pantry'
                      ? 'bg-white text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {stats.pantryTotal}
                </span>
              )}
            </button>

            {/* Tab Escanear Ticket */}
            <button
              onClick={() => setActiveTab('scanner')}
              className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-300'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <ScanLine className="w-4 h-4 animate-bounce" />
              <span className="font-bold">{t.tabScanner}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

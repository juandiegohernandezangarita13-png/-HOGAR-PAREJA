import React, { useState } from 'react';
import { Sparkles, Megaphone, X, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Componente de espacio publicitario inferior ("Espacio para anuncios abajo")
 * Diseñado específicamente para alojar banners de Google AdMob / Google AdSense (formato 320x50 / responsive)
 * cumpliendo con las políticas de Google de etiquetado claro (REKLAMA / PUBLICIDAD / AD)
 * y respetando el espacio de navegación en pantallas móviles y escritorio.
 */
export const BottomAdBanner: React.FC = () => {
  const { t } = useApp();
  const [minimized, setMinimized] = useState(false);

  // Si el usuario decide minimizar temporalmente el banner de prueba
  if (minimized) {
    return (
      <div className="fixed bottom-16 sm:bottom-4 right-4 z-30">
        <button
          onClick={() => setMinimized(false)}
          className="bg-slate-900/85 hover:bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-full shadow-lg backdrop-blur flex items-center gap-1.5 transition cursor-pointer border border-slate-700/50"
          title={t.adTitle}
        >
          <Megaphone className="w-3 h-3 text-amber-400" />
          <span>{t.adBadge}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 1. Versión Móvil: Anclada justo encima de la barra de navegación inferior (sm:hidden) */}
      <div className="sm:hidden fixed bottom-[57px] left-0 right-0 z-30 px-2 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl shadow-xl border border-slate-700/60 p-2 flex items-center justify-between gap-2.5 animate-fadeIn backdrop-blur-md">
          {/* Badge & Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 leading-none">
                  {t.adBadge}
                </span>
                <span className="text-[10px] text-slate-300 font-medium truncate">
                  Google AdMob / AdSense
                </span>
              </div>
              <p className="text-[11px] text-white font-medium truncate mt-0.5">
                {t.adSamplePromo}
              </p>
            </div>
          </div>

          {/* Action & Close */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setMinimized(true)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
              aria-label="Cerrar anuncio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Versión Escritorio / Tablet: Banner horizontal centrado elegante (hidden sm:block) */}
      <aside
        aria-label={t.adTitle}
        className="hidden sm:block max-w-4xl mx-auto px-4 my-6"
      >
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-slate-700/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-inner shrink-0">
              <Megaphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  {t.adBadge}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {t.adSponsorHint}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                {t.adSamplePromo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 border border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-800/60 flex items-center gap-1.5">
              <span>Slot 320x50 / 728x90</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <button
              onClick={() => setMinimized(true)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Ocultar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

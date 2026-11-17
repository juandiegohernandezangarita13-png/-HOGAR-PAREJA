import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Megaphone, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ADSENSE_CLIENT_ID = 'ca-pub-1165320002460420';
const ADSENSE_SLOT_ID =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_ADSENSE_SLOT_ID?.trim() || '';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseSlotProps {
  slotId: string;
  format?: 'auto' | 'horizontal';
  className?: string;
}

const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slotId,
  format = 'horizontal',
  className = '',
}) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current || !slotId) return;
    pushedRef.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignorar errores si AdBlock está activo o el script aún no termina de cargar
    }
  }, [slotId]);

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
};

/**
 * Componente de espacio publicitario inferior conectado a Google AdSense (ca-pub-1165320002460420).
 * - Si se configura VITE_ADSENSE_SLOT_ID en Render/entorno, renderiza el bloque <ins class="adsbygoogle"> oficial.
 * - Si aún no hay Slot ID manual, mantiene el espacio inferior limpio mientras Google Auto Ads gestiona los anuncios.
 */
export const BottomAdBanner: React.FC = () => {
  const { t } = useApp();
  const [minimized, setMinimized] = useState(false);

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
        <div className="max-w-md mx-auto pointer-events-auto bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl shadow-xl border border-slate-700/60 p-2 animate-fadeIn backdrop-blur-md">
          {ADSENSE_SLOT_ID ? (
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 leading-none">
                  {t.adBadge}
                </span>
                <button
                  onClick={() => setMinimized(true)}
                  className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Cerrar anuncio"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="min-h-[50px] overflow-hidden rounded-lg bg-white/5">
                <AdSenseSlot slotId={ADSENSE_SLOT_ID} format="horizontal" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2.5">
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
                      Google AdSense
                    </span>
                  </div>
                  <p className="text-[11px] text-white font-medium truncate mt-0.5">
                    {t.adSamplePromo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMinimized(true)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer shrink-0"
                aria-label="Cerrar anuncio"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Versión Escritorio / Tablet: Banner horizontal centrado (hidden sm:block) */}
      <aside
        aria-label={t.adTitle}
        className="hidden sm:block max-w-4xl mx-auto px-4 my-6"
      >
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-slate-700/60">
          {ADSENSE_SLOT_ID ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                    {t.adBadge}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Google AdSense
                  </span>
                </div>
                <button
                  onClick={() => setMinimized(true)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Ocultar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="min-h-[90px] overflow-hidden rounded-xl bg-white/5">
                <AdSenseSlot slotId={ADSENSE_SLOT_ID} format="horizontal" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
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
                      Google AdSense · {ADSENSE_CLIENT_ID}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {t.adSamplePromo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMinimized(true)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
                title="Ocultar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Copy,
  Check,
  Share2,
  Smartphone,
  RefreshCw,
  Wifi,
  WifiOff,
  Sparkles,
  QrCode,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShareHouseholdModal: React.FC = () => {
  const {
    showShareModal,
    setShowShareModal,
    householdCode,
    setHouseholdCode,
    userName,
    setUserName,
    syncStatus,
    connectedDevices,
    lastUpdatedBy,
    forceSyncNow,
    t,
  } = useApp();

  const [tab, setTab] = useState<'couple' | 'install'>('couple');
  const [codeInput, setCodeInput] = useState(householdCode);
  const [nameInput, setNameInput] = useState(userName);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setCodeInput(householdCode);
  }, [householdCode]);

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  // Capturar el prompt nativo de instalación PWA en Android Chrome
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!showShareModal) return null;

  const baseUrl = window.location.origin;
  const inviteUrl = `${baseUrl}/?hogar=${encodeURIComponent(householdCode || 'HOGAR-PAREJA')}`;
  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(nameInput);
    if (codeInput.trim()) {
      setHouseholdCode(codeInput.trim());
    }
  };

  const handleGenerateRandomCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `DOM-${randomNum}`;
    setCodeInput(newCode);
    setHouseholdCode(newCode);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(householdCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareWhatsApp = () => {
    const message = t.whatsappMessageTemplate
      .replace('{URL}', inviteUrl)
      .replace('{CODE}', householdCode);
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(
    inviteUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Heart className="w-6 h-6 text-rose-200 fill-rose-200" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg leading-tight">
                  {t.shareModalTitle}
                </h3>
                <p className="text-emerald-100 text-xs">
                  {t.shareModalSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white font-bold transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex gap-2 mt-4 bg-black/15 p-1 rounded-xl">
            <button
              onClick={() => setTab('couple')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                tab === 'couple'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-emerald-50 hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.tabCoupleSync}</span>
            </button>
            <button
              onClick={() => setTab('install')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                tab === 'install'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-emerald-50 hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.tabMobileInstall}</span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {tab === 'couple' ? (
            <>
              {/* Estado de conexión en vivo */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="flex items-center gap-2.5">
                  {syncStatus === 'synced' ? (
                    <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Wifi className="w-5 h-5" />
                    </span>
                  ) : (
                    <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <WifiOff className="w-5 h-5" />
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {syncStatus === 'synced'
                          ? t.statusSyncedLive
                          : syncStatus === 'connecting'
                          ? t.statusConnecting
                          : t.statusLocalMode}
                      </span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {connectedDevices} {t.devicesOnline}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {lastUpdatedBy
                        ? `${t.lastChangeBy} ${lastUpdatedBy}`
                        : t.instantSyncNote}
                    </p>
                  </div>
                </div>

                <button
                  onClick={forceSyncNow}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                  title={t.syncNowTooltip}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario de Nombre y Código de Hogar */}
              <form onSubmit={handleSaveSettings} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.yourNameLabel}
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={() => setUserName(nameInput)}
                      placeholder={t.yourNamePlaceholder}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.householdCodeLabel}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                        placeholder="DOM-PAR"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRandomCode}
                        className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
                        title={t.newCodeBtn}
                      >
                        {t.newCodeBtn}
                      </button>
                    </div>
                  </div>
                </div>

                {(nameInput !== userName || codeInput !== householdCode) && (
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    {t.saveAndConnectBtn} "{codeInput}"
                  </button>
                )}
              </form>

              {/* Tarjeta para Compartir con la Novia */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    {t.inviteGirlfriendTitle}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-800 flex items-center gap-1 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <span>{householdCode}</span>
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isLocalhost && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800">
                    💡 <strong>Notice:</strong> {t.localhostNotice}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Código QR escaneable */}
                  <div className="bg-white p-2 rounded-2xl border border-emerald-200 shadow-sm flex flex-col items-center flex-shrink-0">
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      className="w-32 h-32 rounded-lg"
                    />
                    <span className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> {t.scanQrHint}
                    </span>
                  </div>

                  {/* Botones de compartir */}
                  <div className="flex-1 w-full space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.shareDescription}{' '}
                      <strong className="text-emerald-800">{householdCode}</strong>:
                    </p>

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{t.shareWhatsAppBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">{t.linkCopied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-500" />
                          <span>{t.copyDirectLinkBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Pestaña 2: Cómo instalar en iPhone y Android */
            <div className="space-y-4">
              {deferredPrompt && (
                <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                  <div>
                    <h4 className="font-bold text-sm">{t.installDirectAvailable}</h4>
                    <p className="text-xs text-emerald-100">
                      {t.installDirectSubtitle}
                    </p>
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    className="bg-white text-emerald-800 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    {t.installNowBtn}
                  </button>
                </div>
              )}

              {/* Instrucciones para iPhone (iOS) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍎</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {t.installIosTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {t.installIosSubtitle}
                    </p>
                  </div>
                </div>
                <ol className="text-xs text-slate-700 space-y-2 pl-5 list-decimal">
                  <li>{t.installIosStep1}</li>
                  <li>
                    {t.installIosStep2}{' '}
                    <span className="inline-block bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      ⬆️
                    </span>
                  </li>
                  <li>{t.installIosStep3}</li>
                  <li>{t.installIosStep4}</li>
                </ol>
              </div>

              {/* Instrucciones para Android */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {t.installAndroidTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {t.installAndroidSubtitle}
                    </p>
                  </div>
                </div>
                <ol className="text-xs text-slate-700 space-y-2 pl-5 list-decimal">
                  <li>{t.installAndroidStep1}</li>
                  <li>{t.installAndroidStep2}</li>
                  <li>{t.installAndroidStep3}</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

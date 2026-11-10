import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { ShoppingList } from './components/ShoppingList';
import { PantryView } from './components/PantryView';
import { ReceiptScanner } from './components/ReceiptScanner';
import { ShareHouseholdModal } from './components/ShareHouseholdModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { BottomAdBanner } from './components/BottomAdBanner';
import { useApp } from './context/AppContext';
import { initializeNativeApp } from './services/nativePlugins';
import { ShoppingCart, Package, ScanLine, Sparkles, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    t,
    showPrivacyModal,
    setShowPrivacyModal,
  } = useApp();

  useEffect(() => {
    initializeNativeApp();
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-36 sm:pb-12">
      {/* Top Navbar */}
      <Header />
      <ShareHouseholdModal />
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'shopping' && <ShoppingList />}
        {activeTab === 'pantry' && <PantryView />}
        {activeTab === 'scanner' && <ReceiptScanner />}
      </main>

      {/* Bottom Ad Space (Desktop Banner above footer / Mobile Floating Dock) */}
      <BottomAdBanner />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-600">{t.appName}</span>
            <span>• {t.footerDescription}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-semibold underline underline-offset-2 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.privacyPolicy}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Visible only on small screens) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'shopping' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {stats.shoppingPending > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {stats.shoppingPending}
              </span>
            )}
          </div>
          <span className="text-[11px]">{t.tabShopping}</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition bg-indigo-600 text-white shadow-md shadow-indigo-600/30 -mt-4 cursor-pointer`}
        >
          <ScanLine className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-bold">{t.tabScanner}</span>
        </button>

        <button
          onClick={() => setActiveTab('pantry')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'pantry' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {(stats.pantryExpired > 0 || stats.pantryExpiringSoon > 0) && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                !
              </span>
            )}
          </div>
          <span className="text-[11px]">{t.tabPantry}</span>
        </button>
      </div>
    </div>
  );
};
export default App;

import React from 'react';
import { ShieldCheck, Lock, Smartphone, EyeOff, Server, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { language } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">
                {language === 'pl'
                  ? 'Polityka Prywatności & Ochrona Danych (RODO)'
                  : language === 'es'
                  ? 'Política de Privacidad y Protección de Datos (RGPD)'
                  : 'Privacy Policy & Data Protection (GDPR)'}
              </h3>
              <p className="text-emerald-100 text-xs">
                {language === 'pl'
                  ? 'ComprAI • Bezpieczne i lokalne przetwarzanie danych na Twoim telefonie'
                  : language === 'es'
                  ? 'ComprAI • Procesamiento seguro y local en tu propio dispositivo'
                  : 'ComprAI • Secure, on-device data processing on your smartphone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white font-bold transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido según idioma */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-600 leading-relaxed">
          {language === 'pl' ? (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-900 flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-sm">Gwarancja 100% On-Device & Zero-Cost</strong>
                  <span>
                    Twoje paragony i zdjęcia <strong>NIGDY nie są przesyłane do zewnętrznych chmur ani serwerów komercyjnych</strong>.
                    Cały proces odczytu tekstu (OCR) odbywa się wyłącznie w pamięci operacyjnej (RAM) Twojego telefonu.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  1. Administrator Danych i Zasady Ogólne
                </h4>
                <p>
                  Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych w aplikacji <strong>ComprAI</strong> zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
                  Aplikacja została zaprojektowana z myślą o maksymalnej prywatności domowej (Privacy by Design).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-indigo-600" />
                  2. Dostęp do Aparatu i Galerii Zdjęć
                </h4>
                <p>
                  Aplikacja wymaga dostępu do aparatu lub galerii wyłącznie w celu jednorazowego załadowania zdjęcia paragonu fiskalnego. Zdjęcie jest natychmiast przetwarzane na Canvasie w skali szarości, odczytywane przez wbudowany silnik OCR (Tesseract / Google ML Kit) i nie jest zapisywane ani udostępniane podmiotom trzecim.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-600" />
                  3. Synchronizacja Domowa w Parze i Hash SHA-256
                </h4>
                <p>
                  Gdy Ty i Twoja partnerka łączycie się wspólnym kodem gospodarstwa (np. <code>PAREJA-777</code>), serwer synchronizuje w czasie rzeczywistym jedynie:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Listę zakupów (nazwa artykułu, ilość, status kupienia, imię osoby dodającej).</li>
                  <li>Stan spiżarni (nazwa produktu, data ważności, kategoria).</li>
                  <li>
                    Kryptograficzny skrót <strong>SHA-256</strong> paragonu (<code>NIP + Data + Godzina + Kwota PLN</code>) – służący wyłącznie do ochrony przed ponownym, omyłkowym dodaniem tego samego paragonu przez drugą osobę.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-indigo-600" />
                  4. Prawa Użytkownika i Usuwanie Danych
                </h4>
                <p>
                  Zgodnie z RODO przysługuje Ci prawo do:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Dostępu do swoich danych w aplikacji w dowolnym momencie.</li>
                  <li>Sprostowania lub usunięcia każdego produktu jednym dotknięciem ikony kosza.</li>
                  <li>Całkowitego usunięcia danych poprzez wyczyszczenie pamięci podręcznej przeglądarki lub zmianę kodu gospodarstwa domowego.</li>
                </ul>
              </div>
            </>
          ) : language === 'es' ? (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-900 flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-sm">Garantía 100% On-Device & Privacidad Absoluta</strong>
                  <span>
                    Tus tickets de compra y fotografías <strong>NUNCA se envían a servidores externos ni a inteligencias artificiales de pago en la nube</strong>.
                    El análisis OCR se ejecuta íntegramente en la memoria de tu móvil.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  1. Principios Generales y Cumplimiento RGPD
                </h4>
                <p>
                  Esta Política de Privacidad regula el tratamiento de datos en <strong>ComprAI</strong> en cumplimiento con el Reglamento (UE) 2016/679 (RGPD / RODO en Polonia). La app sigue la filosofía de <em>Privacidad por Diseño</em> para la gestión doméstica de parejas.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-indigo-600" />
                  2. Permisos de Cámara y Galería
                </h4>
                <p>
                  El permiso de cámara o galería se utiliza de manera puntual y exclusivamente para digitalizar el ticket físico en el momento del escaneo. Las imágenes no se almacenan permanentemente ni se comparten con terceros.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-600" />
                  3. Sincronización en Pareja y Huella SHA-256
                </h4>
                <p>
                  Al conectar ambos teléfonos con un código de hogar compartido, el servidor únicamente sincroniza:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Productos de la lista de la compra y despensa (nombre, cantidad, fecha estimada de caducidad).</li>
                  <li>
                    El hash criptográfico <strong>SHA-256</strong> del ticket (<code>NIP + Fecha + Hora + Importe</code>), empleado para evitar que ambos registréis el mismo ticket dos veces.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-indigo-600" />
                  4. Derechos ARCO y Supresión
                </h4>
                <p>
                  Tienes derecho a acceder, rectificar o eliminar cualquier dato introducido en cualquier momento con los botones de borrado de la aplicación, o restableciendo los datos locales de tu navegador.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-900 flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-sm">100% On-Device & Zero-Cost Privacy Guarantee</strong>
                  <span>
                    Your receipts and images are <strong>NEVER transmitted to third-party cloud vision servers</strong>. All OCR optical text extraction runs locally in your device's memory.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  1. Data Controller & GDPR Principles
                </h4>
                <p>
                  This Privacy Policy applies to the <strong>ComprAI</strong> app under EU Regulation 2016/679 (GDPR / RODO). Designed under Privacy by Design principles for shared household grocery management.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-indigo-600" />
                  2. Camera and Gallery Permissions
                </h4>
                <p>
                  Camera and photo picker permissions are requested only for the on-device parsing of physical fiscal receipts. The images are processed in-memory and never sold or shared.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-600" />
                  3. Household Synchronization & SHA-256 Hash
                </h4>
                <p>
                  When connected via a shared household code, only the grocery items (name, quantity, shelf life) and the cryptographic SHA-256 receipt signature are synchronized to prevent double-entry between partners.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-indigo-600" />
                  4. Your Rights & Data Deletion
                </h4>
                <p>
                  You retain full rights to access, edit, or delete any recorded grocery or receipt item at any time using in-app controls or clearing browser storage.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Botón de cierre */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            {language === 'pl' ? 'Rozumiem i akceptuję' : language === 'es' ? 'Entendido y Aceptar' : 'Understood and Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

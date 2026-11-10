export type Language = 'pl' | 'es' | 'en';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  footerRights: string;
  footerDescription: string;
  privacyPolicy: string;

  // Tabs
  tabShopping: string;
  tabPantry: string;
  tabScanner: string;

  // Header
  coupleMobile: string;
  devicesOnline: string;
  synced: string;
  connecting: string;
  offline: string;

  // Shopping List
  shoppingTitle: string;
  shoppingPendingCount: string;
  shoppingCompletedCount: string;
  moveToPantryBtn: string;
  addItemPlaceholder: string;
  categoryAuto: string;
  qtyUnit: string;
  addBtn: string;
  searchPlaceholder: string;
  filterAll: string;
  toBuyHeader: string;
  emptyShoppingTitle: string;
  emptyShoppingSubtitle: string;
  inCartHeader: string;
  clearCompleted: string;
  addedByLabel: string;

  // Pantry
  pantryTitle: string;
  pantrySubtitle: string;
  pantryUrgentBannerTitle: string;
  pantryUrgentBannerText: string;
  viewUrgentBtn: string;
  addToPantryBtn: string;
  locationLabel: string;
  locationAll: string;
  locationFridge: string;
  locationFreezer: string;
  locationPantry: string;
  statusLabel: string;
  statusAll: string;
  statusExpired: string;
  statusWarning: string;
  statusGood: string;
  searchPantryPlaceholder: string;
  emptyPantryTitle: string;
  emptyPantrySubtitle: string;
  boughtOn: string;
  limitDate: string;
  actionConsumed: string;
  actionRestock: string;
  restockNote: string;
  deleteItem: string;

  // Manual Add Modal
  manualModalTitle: string;
  productNameLabel: string;
  categoryLabel: string;
  shelfLifeDaysLabel: string;
  cancelBtn: string;
  saveToPantryBtn: string;

  // Scanner
  scannerHeaderBadgeOcr: string;
  scannerHeaderBadgePoland: string;
  scannerTitle: string;
  scannerSubtitle: string;
  scannerDropOrChoose: string;
  scannerFormatHint: string;
  takePhotoCameraBtn: string;
  chooseGalleryBtn: string;
  changePhotoBtn: string;
  seeBinarizedBtn: string;
  seeOriginalBtn: string;
  binarizedSuccessHint: string;
  scanPolishReceiptBtn: string;
  reopenVerificationBtn: string;
  ocrProcessingTitle: string;
  ocrStep1: string;
  ocrStep2: string;
  ocrStep3: string;
  ocrErrorTitle: string;

  // Review Modal
  reviewModalTitle: string;
  reviewModalSubtitle: string;
  storeLabel: string;
  nipLabel: string;
  receiptDateLabel: string;
  receiptTimeLabel: string;
  totalLabel: string;
  duplicateAlertTitle: string;
  duplicateAlertText: string;
  activeItemsCount: string;
  selectAllBtn: string;
  deselectAllBtn: string;
  addRowBtn: string;
  viewOcrTextBtn: string;
  hideOcrTextBtn: string;
  syncWithShoppingListCheckbox: string;
  ocrEmptyHintTitle: string;
  ocrEmptyHintText: string;
  addManualProductBtn: string;
  daysShort: string;
  confirmToHouseholdPantryBtn: string;
  duplicateBlockBtn: string;
  processingTimeInfo: string;

  // Share / Couple Modal
  shareModalTitle: string;
  shareModalSubtitle: string;
  tabCoupleSync: string;
  tabMobileInstall: string;
  statusSyncedLive: string;
  statusConnecting: string;
  statusLocalMode: string;
  lastChangeBy: string;
  instantSyncNote: string;
  syncNowTooltip: string;
  yourNameLabel: string;
  yourNamePlaceholder: string;
  householdCodeLabel: string;
  newCodeBtn: string;
  saveAndConnectBtn: string;
  inviteGirlfriendTitle: string;
  localhostNotice: string;
  scanQrHint: string;
  shareDescription: string;
  shareWhatsAppBtn: string;
  copyDirectLinkBtn: string;
  linkCopied: string;
  codeCopied: string;
  whatsappMessageTemplate: string;

  // Installation
  installDirectAvailable: string;
  installDirectSubtitle: string;
  installNowBtn: string;
  installIosTitle: string;
  installIosSubtitle: string;
  installIosStep1: string;
  installIosStep2: string;
  installIosStep3: string;
  installIosStep4: string;
  installAndroidTitle: string;
  installAndroidSubtitle: string;
  installAndroidStep1: string;
  installAndroidStep2: string;
  installAndroidStep3: string;

  // Expiry Labels
  expiredDaysAgo: string;
  expiresToday: string;
  expiresInDays: string;
  goodForDays: string;

  // Bottom Ad Space
  adBadge: string;
  adTitle: string;
  adSponsorHint: string;
  adSamplePromo: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  pl: {
    appName: 'ComprAI',
    appSubtitle: 'Inteligentna lista zakupów i kontrola terminów ważności dla par',
    footerRights: 'ComprAI • Inteligentne zakupy i zapobieganie marnowaniu żywności',
    footerDescription: 'Lokalne reguły przechowywania, optymalizacja kategorii i prywatny OCR w telefonie',
    privacyPolicy: 'Polityka prywatności (RODO)',

    // Tabs
    tabShopping: 'Lista',
    tabPantry: 'Spiżarnia',
    tabScanner: 'Skanuj',

    // Header
    coupleMobile: 'Para / Telefon',
    devicesOnline: 'online',
    synced: 'Zsynchronizowano',
    connecting: 'Łączenie...',
    offline: 'Tryb offline',

    // Shopping List
    shoppingTitle: '🛒 Lista zakupów',
    shoppingPendingCount: 'do kupienia',
    shoppingCompletedCount: 'w koszyku',
    moveToPantryBtn: 'Przenieś kupione do Spiżarni',
    addItemPlaceholder: 'Dodaj artykuł (np. Mleko 3.2%, Chleb wiejski, Banany, Filet z kurczaka...)',
    categoryAuto: 'Kategoria (Auto)',
    qtyUnit: 'ilość',
    addBtn: 'Dodaj',
    searchPlaceholder: 'Szukaj na liście...',
    filterAll: 'Wszystkie',
    toBuyHeader: 'Do kupienia',
    emptyShoppingTitle: 'Brak zaległych artykułów!',
    emptyShoppingSubtitle: 'Wpisz nazwę u góry lub zeskanuj paragon ze sklepu.',
    inCartHeader: 'Już w koszyku',
    clearCompleted: 'Wyczyść kupione',
    addedByLabel: 'Dodał(a)',

    // Pantry
    pantryTitle: '📦 Moja Spiżarnia i Lodówka',
    pantrySubtitle: 'Kontrola przechowywania, dat ważności i alerty przeterminowania',
    pantryUrgentBannerTitle: 'Uwaga na terminy ważności!',
    pantryUrgentBannerText: 'Masz produkty przeterminowane lub wymagające szybkiego spożycia w ciągu najbliższych 3 dni.',
    viewUrgentBtn: 'Pokaż pilne',
    addToPantryBtn: 'Dodaj do spiżarni',
    locationLabel: 'Miejsce:',
    locationAll: 'Wszystkie',
    locationFridge: 'Lodówka',
    locationFreezer: 'Zamrażarka',
    locationPantry: 'Spiżarnia',
    statusLabel: 'Stan:',
    statusAll: 'Wszystkie',
    statusExpired: '🔴 Przeterminowane',
    statusWarning: '🟡 Kończy się termin',
    statusGood: '🟢 Świeże',
    searchPantryPlaceholder: 'Szukaj w spiżarni...',
    emptyPantryTitle: 'Brak produktów spełniających kryteria',
    emptyPantrySubtitle: 'Dodaj produkty ręcznie lub zeskanuj paragon fiskalny.',
    boughtOn: 'Kupiono:',
    limitDate: 'Termin:',
    actionConsumed: 'Spożyte',
    actionRestock: 'Kup ponownie',
    restockNote: 'Uzupełnij (zużyte ze spiżarni)',
    deleteItem: 'Usuń ze spiżarni',

    // Manual Add Modal
    manualModalTitle: 'Dodaj produkt do Spiżarni',
    productNameLabel: 'Nazwa produktu',
    categoryLabel: 'Kategoria',
    shelfLifeDaysLabel: 'Termin ważności (dni)',
    cancelBtn: 'Anuluj',
    saveToPantryBtn: 'Zapisz w spiżarni',

    // Scanner
    scannerHeaderBadgeOcr: '100% On-Device OCR (Zero-Cost)',
    scannerHeaderBadgePoland: 'Zoptymalizowane pod polskie paragony (Biedronka, Lidl, Żabka, Dino...)',
    scannerTitle: 'Lokalny Skaner Paragonów Fiskalnych',
    scannerSubtitle: 'Zrób zdjęcie paragonu. Preprocessing na Canvasie i silnik OCR wykonują się w 100% w Twoim telefonie bez płatnych API chmurowych, z deduplikacją SHA-256.',
    scannerDropOrChoose: 'Zrób lub przeciągnij zdjęcie paragonu fiskalnego',
    scannerFormatHint: 'Zadbaj o dobre światło i objęcie kolumny z cenami aż do linii SUMA PLN.',
    takePhotoCameraBtn: 'Zrób zdjęcie aparatem',
    chooseGalleryBtn: 'Wybierz z galerii',
    changePhotoBtn: 'Zmień zdjęcie',
    seeBinarizedBtn: 'Podgląd binarizacji',
    seeOriginalBtn: 'Podgląd oryginału',
    binarizedSuccessHint: '⚡ Obraz zoptymalizowany pod kątem tuszu termicznego w',
    scanPolishReceiptBtn: 'Skanuj Paragon Fiskalny (OCR w telefonie)',
    reopenVerificationBtn: 'Otwórz weryfikację',
    ocrProcessingTitle: 'Przetwarzanie paragonu w Twoim telefonie...',
    ocrStep1: '1. Skalowanie do 1400px i binarizacja termiczna w Canvas',
    ocrStep2: '2. Ekstrakcja tekstu w dedykowanym Web Workerze (polski)',
    ocrStep3: '3. Parser fiskalny i generowanie unikalnego skrótu SHA-256',
    ocrErrorTitle: 'Błąd podczas odczytu paragonu',

    // Review Modal
    reviewModalTitle: 'Weryfikacja Paragonu Fiskalnego',
    reviewModalSubtitle: 'Sprawdź, edytuj lub usuń niepotrzebne linie przed synchronizacją z domem',
    storeLabel: 'Sklep:',
    nipLabel: 'NIP:',
    receiptDateLabel: 'Data zakupu:',
    receiptTimeLabel: 'Godzina / Razem:',
    totalLabel: 'Razem PLN:',
    duplicateAlertTitle: 'Wykryto zduplikowany paragon! (Ochrona przed podwójnym zapisem)',
    duplicateAlertText: 'Unikalny hash SHA-256 tego paragonu został już wcześniej zarejestrowany w Waszej spiżarni.',
    activeItemsCount: 'aktywnych pozycji',
    selectAllBtn: 'Zaznacz wszystkie',
    deselectAllBtn: 'Odznacz wszystkie',
    addRowBtn: 'Dodaj pozycję',
    viewOcrTextBtn: 'Pokaż surowy tekst OCR',
    hideOcrTextBtn: 'Ukryj tekst OCR',
    syncWithShoppingListCheckbox: 'Odznacz na liście zakupów',
    ocrEmptyHintTitle: 'Nie wykryto pozycji fiskalnych automatycznie.',
    ocrEmptyHintText: 'Upewnij się, że zdjęcie jest ostre i zawiera prawą kolumnę cen lub dodaj produkty ręcznie poniżej.',
    addManualProductBtn: 'Dodaj pozycję ręcznie',
    daysShort: 'dni',
    confirmToHouseholdPantryBtn: 'Zatwierdź i dodaj do domowej spiżarni',
    duplicateBlockBtn: 'Paragon już zarejestrowany w domu',
    processingTimeInfo: 'Czas przetwarzania:',

    // Share / Couple Modal
    shareModalTitle: 'Wspólny Dom & Synchronizacja Telefonów',
    shareModalSubtitle: 'Czas rzeczywisty dla Ciebie i Twojej dziewczyny (Android i iPhone)',
    tabCoupleSync: '1. Synchronizacja w parze',
    tabMobileInstall: '2. Instalacja na iPhone / Android',
    statusSyncedLive: 'Połączono i zsynchronizowano na żywo',
    statusConnecting: 'Łączenie z domem...',
    statusLocalMode: 'Tryb lokalny (brak połączenia z serwerem)',
    lastChangeBy: 'Ostatnia zmiana wprowadzona przez:',
    instantSyncNote: 'Każda zmiana pojawia się natychmiast na obu telefonach.',
    syncNowTooltip: 'Synchronizuj teraz',
    yourNameLabel: 'Twoje imię na tym telefonie',
    yourNamePlaceholder: 'Np. Jan lub imię partnerki',
    householdCodeLabel: 'Kod Waszego Gospodarstwa',
    newCodeBtn: '🎲 Nowy',
    saveAndConnectBtn: 'Zapisz i połącz z kodem',
    inviteGirlfriendTitle: 'Zaproś swoją dziewczynę 1 kliknięciem',
    localhostNotice: 'Używasz aplikacji lokalnie. Aby działała poza domem 24/7 z dowolnego miejsca z internetem, uruchom wersję w chmurze.',
    scanQrHint: 'Zeskanuj aparatem',
    shareDescription: 'Po otwarciu linku telefon Twojej dziewczyny połączy się automatycznie z kodem:',
    shareWhatsAppBtn: 'Wyślij zaproszenie przez WhatsApp do dziewczyny',
    copyDirectLinkBtn: 'Kopiuj bezpośredni link',
    linkCopied: 'Link skopiowany!',
    codeCopied: 'Kod skopiowany!',
    whatsappMessageTemplate: 'Kochanie! 🛒 Skonfigurowałem naszą wspólną aplikację do listy zakupów i spiżarni (ComprAI).\n\n1️⃣ Otwórz ten link w telefonie:\n{URL}\n\n2️⃣ Na iPhonie kliknij Udostępnij ➔ "Do początkowego ekranu" (albo na Androidzie "Zainstaluj aplikację").\n\nNasz wspólny kod to: *{CODE}* ❤️',

    // Installation
    installDirectAvailable: 'Bezpośrednia instalacja dostępna!',
    installDirectSubtitle: 'Zainstaluj ComprAI na ekranie głównym 1 dotknięciem.',
    installNowBtn: 'Zainstaluj teraz',
    installIosTitle: 'Instalacja na iPhone (iOS)',
    installIosSubtitle: 'Działa na pełnym ekranie z własną ikoną, dokładnie jak aplikacja z App Store',
    installIosStep1: 'Otwórz link do aplikacji w przeglądarce Safari na iPhonie.',
    installIosStep2: 'Kliknij przycisk Udostępnij ⬆️ na dolnym pasku Safari.',
    installIosStep3: 'Przewiń w dół i wybierz „Do początkowego ekranu” (Add to Home Screen).',
    installIosStep4: 'Kliknij „Dodaj” w prawym górnym rogu. Gotowe!',
    installAndroidTitle: 'Instalacja na telefonie Android',
    installAndroidSubtitle: 'Instaluje się jako natywna aplikacja WebAPK bez zajmowania pamięci',
    installAndroidStep1: 'Otwórz link do aplikacji w Google Chrome na telefonie z Androidem.',
    installAndroidStep2: 'Dotknij menu trzech kropek ⋮ w prawym górnym rogu.',
    installAndroidStep3: 'Wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.',

    // Expiry Labels
    expiredDaysAgo: 'Przeterminowane {DAYS} dni temu',
    expiresToday: 'Termin upływa dzisiaj',
    expiresInDays: 'Ważne jeszcze {DAYS} dni',
    goodForDays: 'Ważne {DAYS} dni',

    // Bottom Ad Space
    adBadge: 'REKLAMA',
    adTitle: 'Przestrzeń reklamowa',
    adSponsorHint: 'Miejsce zarezerwowane na baner Google AdMob / AdSense',
    adSamplePromo: 'Oszczędzaj na zakupach i planuj posiłki dla dwojga z ComprAI',
  },

  es: {
    appName: 'ComprAI',
    appSubtitle: 'Lista de la compra inteligente & control de caducidades en pareja',
    footerRights: 'ComprAI • Gestión inteligente de compras & prevención de desperdicio de alimentos',
    footerDescription: 'Reglas de conservación optimizadas por categoría e inteligencia visual local en el móvil',
    privacyPolicy: 'Política de Privacidad (RGPD / RODO)',

    // Tabs
    tabShopping: 'Lista',
    tabPantry: 'Despensa',
    tabScanner: 'Escanear',

    // Header
    coupleMobile: 'Pareja / Móvil',
    devicesOnline: 'online',
    synced: 'Sincronizado',
    connecting: 'Conectando...',
    offline: 'Modo local',

    // Shopping List
    shoppingTitle: '🛒 Lista de la Compra',
    shoppingPendingCount: 'por comprar',
    shoppingCompletedCount: 'en el carrito',
    moveToPantryBtn: 'Pasar comprados a la Despensa',
    addItemPlaceholder: 'Añadir artículo (ej: Leche entera, Plátanos, Salmón, Pechuga de pollo...)',
    categoryAuto: 'Categoría (Auto)',
    qtyUnit: 'cant',
    addBtn: 'Añadir',
    searchPlaceholder: 'Buscar en tu lista...',
    filterAll: 'Todos',
    toBuyHeader: 'Por Comprar',
    emptyShoppingTitle: '¡No tienes artículos pendientes!',
    emptyShoppingSubtitle: 'Escribe arriba para añadir productos o escanea un ticket de compra.',
    inCartHeader: 'Ya en el Carrito',
    clearCompleted: 'Limpiar completados',
    addedByLabel: 'Añadido por',

    // Pantry
    pantryTitle: '📦 Mi Despensa & Nevera',
    pantrySubtitle: 'Control de conservación, fechas de consumo y avisos de caducidad',
    pantryUrgentBannerTitle: 'Atención a tus Caducidades',
    pantryUrgentBannerText: 'Tienes productos caducados o por vencer en menos de 3 días.',
    viewUrgentBtn: 'Ver Urgentes',
    addToPantryBtn: 'Añadir a Despensa',
    locationLabel: 'Ubicación:',
    locationAll: 'Todas',
    locationFridge: 'Nevera',
    locationFreezer: 'Congelador',
    locationPantry: 'Despensa',
    statusLabel: 'Estado:',
    statusAll: 'Todos',
    statusExpired: '🔴 Caducados',
    statusWarning: '🟡 Por vencer',
    statusGood: '🟢 Buenos',
    searchPantryPlaceholder: 'Buscar en despensa...',
    emptyPantryTitle: 'No hay artículos con estos filtros',
    emptyPantrySubtitle: 'Añade productos manualmente o escanea un ticket de compra.',
    boughtOn: 'Comprado:',
    limitDate: 'Límite:',
    actionConsumed: 'Consumido',
    actionRestock: 'Reponer',
    restockNote: 'Reponer (Consumido de despensa)',
    deleteItem: 'Eliminar de la despensa',

    // Manual Add Modal
    manualModalTitle: 'Añadir a la Despensa',
    productNameLabel: 'Nombre del Producto',
    categoryLabel: 'Categoría',
    shelfLifeDaysLabel: 'Caducidad (Días de vida)',
    cancelBtn: 'Cancelar',
    saveToPantryBtn: 'Guardar en Despensa',

    // Scanner
    scannerHeaderBadgeOcr: '100% On-Device OCR (Zero-Cost)',
    scannerHeaderBadgePoland: 'Optimizado para tickets polacos (Biedronka, Lidl, Żabka, Dino...)',
    scannerTitle: 'Escáner Fiscal Polaco en tu Dispositivo',
    scannerSubtitle: 'Sube o toma una foto de tu ticket. El preprocesamiento en Canvas y el OCR se ejecutan 100% en tu teléfono sin costes de API externas, con deduplicación SHA-256.',
    scannerDropOrChoose: 'Arrastra la foto de tu ticket aquí o selecciona una opción:',
    scannerFormatHint: 'Formatos soportados: JPG, PNG, WEBP, HEIC. Asegúrate de enfocar hasta la línea SUMA PLN.',
    takePhotoCameraBtn: 'Tomar Foto con Cámara',
    chooseGalleryBtn: 'Elegir de la Galería',
    changePhotoBtn: 'Cambiar foto',
    seeBinarizedBtn: 'Ver Binarizado',
    seeOriginalBtn: 'Ver Original',
    binarizedSuccessHint: '⚡ Imagen binarizada a escala de grises (máx. 1400px) en',
    scanPolishReceiptBtn: 'Escanear Paragon Fiskalny (On-Device OCR)',
    reopenVerificationBtn: 'Reabrir Verificación',
    ocrProcessingTitle: 'Ejecutando OCR Local en tu Dispositivo...',
    ocrStep1: '1. Escalado <=1400px y binarización térmica en Canvas',
    ocrStep2: '2. Extracción OCR en Web Worker dedicado (idioma polaco)',
    ocrStep3: '3. Parser fiscal polaco y hash criptográfico SHA-256',
    ocrErrorTitle: 'Error al escanear el ticket',

    // Review Modal
    reviewModalTitle: 'Verificación de Ticket Polaco (Paragon Fiskalny)',
    reviewModalSubtitle: 'Revisa, edita o elimina líneas ruidosas antes de sincronizar con el hogar',
    storeLabel: 'Tienda (Sklep):',
    nipLabel: 'NIP Fiscal:',
    receiptDateLabel: 'Fecha Compra:',
    receiptTimeLabel: 'Hora / Total PLN:',
    totalLabel: 'Total PLN:',
    duplicateAlertTitle: '¡Ticket Duplicado Detectado! (Prevención de Doble Registro)',
    duplicateAlertText: 'El hash único de este ticket ya fue registrado previamente en la despensa del hogar por ti o por tu pareja.',
    activeItemsCount: 'productos activos',
    selectAllBtn: 'Marcar todos',
    deselectAllBtn: 'Desmarcar todos',
    addRowBtn: 'Añadir fila',
    viewOcrTextBtn: 'Ver texto OCR',
    hideOcrTextBtn: 'Ocultar OCR bruto',
    syncWithShoppingListCheckbox: 'Tachar de la lista de compra',
    ocrEmptyHintTitle: 'No se detectaron líneas con formato de precio fiscal polaco automáticamente.',
    ocrEmptyHintText: 'Asegúrate de que la foto esté bien enfocada e incluya la columna derecha de precios, o añade productos manualmente.',
    addManualProductBtn: 'Añadir Producto Manualmente',
    daysShort: 'd',
    confirmToHouseholdPantryBtn: 'Confirmar e integrar a la despensa del hogar',
    duplicateBlockBtn: 'Ticket ya registrado en el hogar',
    processingTimeInfo: 'Procesado en:',

    // Share / Couple Modal
    shareModalTitle: 'Hogar Compartido & Móviles',
    shareModalSubtitle: 'Sincronización en tiempo real para ti y tu novia (Android & iPhone)',
    tabCoupleSync: '1. Sincronizar Pareja',
    tabMobileInstall: '2. Instalar en iPhone / Android',
    statusSyncedLive: 'Conectado y sincronizado en vivo',
    statusConnecting: 'Conectando con el hogar...',
    statusLocalMode: 'Modo local (sin conexión al servidor)',
    lastChangeBy: 'Último cambio realizado por:',
    instantSyncNote: 'Cualquier cambio se refleja al instante en ambos teléfonos.',
    syncNowTooltip: 'Sincronizar ahora',
    yourNameLabel: 'Tu nombre en este teléfono',
    yourNamePlaceholder: 'Ej: Juan o nombre de tu novia',
    householdCodeLabel: 'Código de vuestro Hogar',
    newCodeBtn: '🎲 Nuevo',
    saveAndConnectBtn: 'Guardar y Conectar al Código',
    inviteGirlfriendTitle: 'Invita a tu novia en 1 clic',
    localhostNotice: 'Ahora mismo estás abriendo la app desde un entorno local. Para usarla en cualquier sitio con 4G/Wi-Fi sin depender de la PC, usa el despliegue en la nube.',
    scanQrHint: 'Escanear con cámara',
    shareDescription: 'Al abrir este enlace, el teléfono de tu novia se conectará automáticamente al código:',
    shareWhatsAppBtn: 'Enviar Enlace por WhatsApp a mi Novia',
    copyDirectLinkBtn: 'Copiar enlace directo',
    linkCopied: '¡Enlace copiado!',
    codeCopied: '¡Código copiado!',
    whatsappMessageTemplate: '¡Amor! 🛒 He configurado nuestra app de lista de la compra y despensa compartida (ComprAI).\n\n1️⃣ Entra en este enlace desde tu móvil:\n{URL}\n\n2️⃣ En tu iPhone dale a Compartir ➔ "Añadir a pantalla de inicio" (o en Android "Instalar aplicación").\n\nNuestro código de hogar es: *{CODE}* ❤️',

    // Installation
    installDirectAvailable: '¡Instalación directa disponible!',
    installDirectSubtitle: 'Instala ComprAI en la pantalla de inicio de tu teléfono con 1 toque.',
    installNowBtn: 'Instalar Ahora',
    installIosTitle: 'Cómo instalarla en el iPhone (iOS)',
    installIosSubtitle: 'Quedará con su icono en la pantalla de inicio a pantalla completa, igual que una app de la App Store',
    installIosStep1: 'Abre el enlace de la app desde Safari en el iPhone.',
    installIosStep2: 'Pulsa el botón Compartir ⬆️ en la barra inferior de Safari.',
    installIosStep3: 'Baja un poco y selecciona «Añadir a la pantalla de inicio» (Add to Home Screen).',
    installIosStep4: 'Pulsa Añadir arriba a la derecha. ¡Listo!',
    installAndroidTitle: 'Cómo instalarla en Android',
    installAndroidSubtitle: 'Se instala como WebAPK nativa sin ocupar espacio',
    installAndroidStep1: 'Abre el enlace de la app en Google Chrome en tu móvil Android.',
    installAndroidStep2: 'Toca el menú de los tres puntos ⋮ (arriba a la derecha).',
    installAndroidStep3: 'Pulsa en «Instalar aplicación» o «Añadir a pantalla de inicio».',

    // Expiry Labels
    expiredDaysAgo: 'Caducó hace {DAYS} día(s)',
    expiresToday: 'Caduca hoy',
    expiresInDays: 'Caduca en {DAYS} día(s)',
    goodForDays: 'Vence en {DAYS} días',

    // Bottom Ad Space
    adBadge: 'PUBLICIDAD',
    adTitle: 'Espacio publicitario',
    adSponsorHint: 'Espacio reservado para banner Google AdMob / AdSense',
    adSamplePromo: 'Planifica tus compras y ahorra en el supermercado con ComprAI',
  },

  en: {
    appName: 'ComprAI',
    appSubtitle: 'Smart couple shopping list & food expiry tracker',
    footerRights: 'ComprAI • Smart grocery management & food waste prevention',
    footerDescription: 'Category-optimized shelf-life rules and private on-device mobile OCR',
    privacyPolicy: 'Privacy Policy (GDPR / RODO)',

    // Tabs
    tabShopping: 'List',
    tabPantry: 'Pantry',
    tabScanner: 'Scan',

    // Header
    coupleMobile: 'Couple / Mobile',
    devicesOnline: 'online',
    synced: 'Synced',
    connecting: 'Connecting...',
    offline: 'Local mode',

    // Shopping List
    shoppingTitle: '🛒 Shopping List',
    shoppingPendingCount: 'to buy',
    shoppingCompletedCount: 'in cart',
    moveToPantryBtn: 'Move bought items to Pantry',
    addItemPlaceholder: 'Add item (e.g. Milk 3.2%, Bread, Bananas, Chicken breast...)',
    categoryAuto: 'Category (Auto)',
    qtyUnit: 'qty',
    addBtn: 'Add',
    searchPlaceholder: 'Search list...',
    filterAll: 'All',
    toBuyHeader: 'To Buy',
    emptyShoppingTitle: 'No pending items!',
    emptyShoppingSubtitle: 'Type above to add items or scan a store receipt.',
    inCartHeader: 'In Cart',
    clearCompleted: 'Clear completed',
    addedByLabel: 'Added by',

    // Pantry
    pantryTitle: '📦 My Pantry & Fridge',
    pantrySubtitle: 'Storage tracking, expiry dates and spoilage warnings',
    pantryUrgentBannerTitle: 'Expiry Attention Needed',
    pantryUrgentBannerText: 'You have expired products or items expiring in less than 3 days.',
    viewUrgentBtn: 'View Urgent',
    addToPantryBtn: 'Add to Pantry',
    locationLabel: 'Location:',
    locationAll: 'All',
    locationFridge: 'Fridge',
    locationFreezer: 'Freezer',
    locationPantry: 'Pantry',
    statusLabel: 'Status:',
    statusAll: 'All',
    statusExpired: '🔴 Expired',
    statusWarning: '🟡 Expiring soon',
    statusGood: '🟢 Fresh',
    searchPantryPlaceholder: 'Search pantry...',
    emptyPantryTitle: 'No items matching criteria',
    emptyPantrySubtitle: 'Add items manually or scan a receipt.',
    boughtOn: 'Bought:',
    limitDate: 'Expiry:',
    actionConsumed: 'Consumed',
    actionRestock: 'Restock',
    restockNote: 'Restock (Consumed from pantry)',
    deleteItem: 'Delete from pantry',

    // Manual Add Modal
    manualModalTitle: 'Add Item to Pantry',
    productNameLabel: 'Product Name',
    categoryLabel: 'Category',
    shelfLifeDaysLabel: 'Shelf Life (Days)',
    cancelBtn: 'Cancel',
    saveToPantryBtn: 'Save to Pantry',

    // Scanner
    scannerHeaderBadgeOcr: '100% On-Device OCR (Zero-Cost)',
    scannerHeaderBadgePoland: 'Optimized for Polish receipts (Biedronka, Lidl, Żabka, Dino...)',
    scannerTitle: 'On-Device Polish Receipt Scanner',
    scannerSubtitle: 'Snap a picture of your receipt. Canvas preprocessing and OCR engine run 100% on your device without paid cloud vision APIs, with SHA-256 deduplication.',
    scannerDropOrChoose: 'Drop your receipt photo here or choose an option:',
    scannerFormatHint: 'Supported formats: JPG, PNG, WEBP, HEIC. Ensure lighting captures down to SUMA PLN.',
    takePhotoCameraBtn: 'Take Photo with Camera',
    chooseGalleryBtn: 'Choose from Gallery',
    changePhotoBtn: 'Change photo',
    seeBinarizedBtn: 'View Binarized',
    seeOriginalBtn: 'View Original',
    binarizedSuccessHint: '⚡ Thermal-binarized image (max 1400px) created in',
    scanPolishReceiptBtn: 'Scan Fiscal Receipt (On-Device OCR)',
    reopenVerificationBtn: 'Reopen Review',
    ocrProcessingTitle: 'Running Local OCR on Device...',
    ocrStep1: '1. Resize <=1400px & thermal binarization in Canvas',
    ocrStep2: '2. Text extraction in dedicated Web Worker (Polish language)',
    ocrStep3: '3. Polish fiscal parser & SHA-256 cryptographic hash',
    ocrErrorTitle: 'Error scanning receipt',

    // Review Modal
    reviewModalTitle: 'Polish Fiscal Receipt Review (Paragon Fiskalny)',
    reviewModalSubtitle: 'Verify, edit, or remove noisy lines before syncing with your household',
    storeLabel: 'Store (Sklep):',
    nipLabel: 'Fiscal NIP:',
    receiptDateLabel: 'Purchase Date:',
    receiptTimeLabel: 'Time / Total PLN:',
    totalLabel: 'Total PLN:',
    duplicateAlertTitle: 'Duplicate Receipt Detected! (Double-Entry Protection)',
    duplicateAlertText: 'The unique SHA-256 hash of this receipt was already registered in your household pantry.',
    activeItemsCount: 'active items',
    selectAllBtn: 'Select all',
    deselectAllBtn: 'Deselect all',
    addRowBtn: 'Add row',
    viewOcrTextBtn: 'View raw OCR text',
    hideOcrTextBtn: 'Hide raw OCR',
    syncWithShoppingListCheckbox: 'Check off shopping list',
    ocrEmptyHintTitle: 'No fiscal price lines were detected automatically.',
    ocrEmptyHintText: 'Make sure the photo is sharp and includes the right price column, or add items manually below.',
    addManualProductBtn: 'Add Product Manually',
    daysShort: 'd',
    confirmToHouseholdPantryBtn: 'Confirm and add to household pantry',
    duplicateBlockBtn: 'Receipt already registered in household',
    processingTimeInfo: 'Processed in:',

    // Share / Couple Modal
    shareModalTitle: 'Shared Household & Mobile Devices',
    shareModalSubtitle: 'Real-time synchronization for you and your partner (Android & iPhone)',
    tabCoupleSync: '1. Couple Sync',
    tabMobileInstall: '2. Install on iPhone / Android',
    statusSyncedLive: 'Connected and synced live',
    statusConnecting: 'Connecting to household...',
    statusLocalMode: 'Local mode (no server connection)',
    lastChangeBy: 'Last change made by:',
    instantSyncNote: 'Any change appears instantly on both phones.',
    syncNowTooltip: 'Sync now',
    yourNameLabel: 'Your name on this phone',
    yourNamePlaceholder: 'E.g. Juan or partner name',
    householdCodeLabel: 'Your Household Code',
    newCodeBtn: '🎲 New',
    saveAndConnectBtn: 'Save and Connect to Code',
    inviteGirlfriendTitle: 'Invite your partner in 1 click',
    localhostNotice: 'You are currently accessing via localhost. For 24/7 internet access on mobile, use the cloud-deployed URL.',
    scanQrHint: 'Scan with camera',
    shareDescription: 'Opening this link will automatically connect your partner to household code:',
    shareWhatsAppBtn: 'Send WhatsApp Invitation to Partner',
    copyDirectLinkBtn: 'Copy direct link',
    linkCopied: 'Link copied!',
    codeCopied: 'Code copied!',
    whatsappMessageTemplate: 'Hey sweetheart! 🛒 I set up our shared shopping list and pantry app (ComprAI).\n\n1️⃣ Open this link on your phone:\n{URL}\n\n2️⃣ On iPhone tap Share ➔ "Add to Home Screen" (or on Android "Install App").\n\nOur shared household code is: *{CODE}* ❤️',

    // Installation
    installDirectAvailable: 'Direct installation available!',
    installDirectSubtitle: 'Install ComprAI on your home screen with 1 tap.',
    installNowBtn: 'Install Now',
    installIosTitle: 'How to install on iPhone (iOS)',
    installIosSubtitle: 'Runs full-screen with its own icon, just like an App Store app',
    installIosStep1: 'Open the app link in Safari on the iPhone.',
    installIosStep2: 'Tap the Share button ⬆️ on the bottom bar of Safari.',
    installIosStep3: 'Scroll down and select "Add to Home Screen".',
    installIosStep4: 'Tap "Add" in the top-right corner. All set!',
    installAndroidTitle: 'How to install on Android',
    installAndroidSubtitle: 'Installs as a lightweight native WebAPK',
    installAndroidStep1: 'Open the app link in Google Chrome on your Android phone.',
    installAndroidStep2: 'Tap the three-dots menu ⋮ in the upper right.',
    installAndroidStep3: 'Select "Install app" or "Add to Home screen".',

    // Expiry Labels
    expiredDaysAgo: 'Expired {DAYS} day(s) ago',
    expiresToday: 'Expires today',
    expiresInDays: 'Expires in {DAYS} day(s)',
    goodForDays: 'Good for {DAYS} days',

    // Bottom Ad Space
    adBadge: 'ADVERTISEMENT',
    adTitle: 'Ad Space',
    adSponsorHint: 'Reserved slot for Google AdMob / AdSense banner',
    adSamplePromo: 'Save on grocery shopping and plan meals together with ComprAI',
  },
};

export const CATEGORY_TRANSLATIONS: Record<Language, Record<string, string>> = {
  pl: {
    frutas_verduras: 'Owoce i Warzywa',
    carnes_aves: 'Mięso i Drób',
    pescados_mariscos: 'Ryby i Owoce Morza',
    lacteos_huevos: 'Nabiał i Jaja',
    embutidos_quesos: 'Wędliny i Sery',
    panaderia_pasteleria: 'Pieczywo i Cukiernia',
    despensa_conservas: 'Spiżarnia i Konserwy',
    congelados: 'Mrożonki',
    bebidas: 'Napoje',
    limpieza_hogar: 'Środki Czystości',
    otros: 'Inne',
  },
  es: {
    frutas_verduras: 'Frutas y Verduras',
    carnes_aves: 'Carnes y Aves',
    pescados_mariscos: 'Pescados y Mariscos',
    lacteos_huevos: 'Lácteos y Huevos',
    embutidos_quesos: 'Charcutería y Quesos',
    panaderia_pasteleria: 'Panadería y Bollería',
    despensa_conservas: 'Despensa y Conservas',
    congelados: 'Congelados',
    bebidas: 'Bebidas',
    limpieza_hogar: 'Limpieza y Hogar',
    otros: 'Otros',
  },
  en: {
    frutas_verduras: 'Fruits & Vegetables',
    carnes_aves: 'Meat & Poultry',
    pescados_mariscos: 'Fish & Seafood',
    lacteos_huevos: 'Dairy & Eggs',
    embutidos_quesos: 'Deli & Cheeses',
    panaderia_pasteleria: 'Bakery & Pastries',
    despensa_conservas: 'Pantry & Canned Goods',
    congelados: 'Frozen Foods',
    bebidas: 'Beverages',
    limpieza_hogar: 'Cleaning & Home',
    otros: 'Other',
  },
};

/**
 * Detecta automáticamente el idioma del dispositivo del usuario:
 * 1. Preferencia explícita en localStorage si el usuario la cambió manualmente.
 * 2. Idioma configurado en el sistema del teléfono/navegador (navigator.languages / navigator.language).
 *    - Si empieza por 'pl' -> Polski ('pl')
 *    - Si empieza por 'es' -> Español ('es')
 *    - Por defecto -> Inglés ('en')
 */
export function detectDeviceLanguage(): Language {
  try {
    const saved = localStorage.getItem('comprai_language');
    if (saved === 'pl' || saved === 'es' || saved === 'en') {
      return saved;
    }

    const navLangs = navigator.languages || [navigator.language || ''];
    for (const l of navLangs) {
      const lower = String(l || '').toLowerCase();
      if (lower.startsWith('pl')) return 'pl';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('en')) return 'en';
    }
  } catch {
    // ignore
  }
  return 'pl'; // Si está en Polonia o falla, polaco prioritario
}

# 🛒 ComprAI - Lista de Compra Inteligente & Control de Caducidades

Una aplicación web moderna y reactiva diseñada para optimizar las compras del hogar, digitalizar tickets de compra mediante Visión por IA y prevenir el desperdicio de alimentos estimando automáticamente las fechas de caducidad.

---

## 🌟 Características Principales

### 1. 🛒 Lista de la Compra Interactiva
- **Inserción rápida e inteligente**: Detección automática de categorías (Lácteos, Carnes, Frutas/Verduras, etc.) al escribir.
- **Selector de unidades y cantidades**: `ud`, `kg`, `l`, `pack`.
- **Filtros por categoría y barra de búsqueda en tiempo real**.
- **Gestión de carrito**: Marca de artículos completados con animación y opción de limpiar.
- **Traspaso automático a la Despensa**: Con un solo clic (`Pasar comprados a la Despensa`), los artículos marcados se transfieren a tu despensa y se calculan sus fechas estimadas de caducidad.

### 2. 🧾 Escáner Inteligente de Tickets de Compra
- **Subida de fotos o captura directa con cámara** móvil o web.
- **Procesamiento Multimodal con IA**:
  - Reconoce el nombre del supermercado y la fecha de compra.
  - Limpia abreviaturas típicas (ej: *"LECH ENT"* ➔ *"Leche entera"*, *"PECH POLL"* ➔ *"Pechuga de pollo"*).
  - Extrae precios y cantidades.
- **Tickets de Demostración con 1 Clic**: Prueba inmediata con tickets reales de Mercadona y Carrefour sin necesidad de subir fotos.
- **Modal de Revisión**: Permite verificar, editar días de vida útil, cambiar categorías y desmarcar artículos antes de guardarlos en la despensa.

### 3. 📦 Control de Despensa & Semáforo de Caducidad
- **Cálculo dinámico de días de consumo preferente**:
  - Pescados y mariscos frescos: 1-2 días.
  - Carnes de ave y picada: 2-3 días.
  - Frutas delicadas (fresas, lechuga): 3-5 días.
  - Lácteos y huevos: 7-21 días.
  - Despensa seca y conservas: 6 meses a 2 años.
- **Semáforo visual de alerta**:
  - 🔴 **Caducado**: Notificación prioritaria con conteo de días vencidos.
  - 🟡 **Por Caducar (≤ 3 días)**: Alerta preventiva para consumo urgente.
  - 🟢 **En buen estado**: Días restantes claros y visuales.
- **Filtrado por ubicación de conservación**:
  - ❄️ Nevera
  - 🧊 Congelador
  - 🧺 Despensa
- **Acciones Rápidas**:
  - `✅ Consumido`: Archiva el producto.
  - `🛒 Reponer`: Envía el producto de vuelta a tu Lista de la Compra con un toque.

---

## 🚀 Cómo Ejecutar la Aplicación

El entorno ya se encuentra configurado y corriendo:

```bash
# Iniciar frontend y backend conjuntamente
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

### (Opcional) Configurar Gemini Vision API

La aplicación incluye un motor heurístico y tickets de prueba listos para usar sin clave. Si deseas activar el escaneo multimodal con tu propia clave de Google Gemini:

1. Crea un archivo `.env` en la raíz (puedes basarte en `.env.example`).
2. Añade tu clave:
   ```env
   GEMINI_API_KEY=tu_clave_aqui
   ```
3. Reinicia el servidor con `npm run dev`.

---

## 📱 Soporte Móvil Nativo (Capacitor: Android & iOS)

El proyecto cuenta con **Capacitor 8** configurado junto a los plugins nativos oficiales:

- 📷 **`@capacitor/camera`**: Captura de tickets con la cámara nativa del dispositivo y selector de galería con permisos configurados en `AndroidManifest.xml` e `Info.plist`.
- 💾 **`@capacitor/preferences`**: Almacenamiento local nativo optimizado.
- 🎨 **`@capacitor/status-bar`**: Estilizado de la barra de estado superior con colores de la app.
- 🚀 **`@capacitor/splash-screen`**: Pantalla de bienvenida nativa.
- 💬 **`@capacitor/toast`**: Notificaciones nativas en pantalla.

### Comandos de Compilación y Sincronización Móvil

```bash
# Compilar código web y sincronizar proyectos nativos Android e iOS
npm run build:mobile

# Abrir proyecto en Android Studio (para generar APK / depurar en emulador o móvil)
npm run cap:android

# Abrir proyecto en Xcode (requiere macOS)
npm run cap:ios
```

### Compilación para Android e iOS

- **Android**: Puedes abrir el proyecto en **Android Studio** (`npm run cap:android`) y presionar *Build > Build Bundle(s) / APK(s) > Build APK(s)*, o compilar con `./gradlew assembleDebug` en la carpeta `android/` si dispones de JDK 17/21 y Android SDK instalados.
- **iOS**: Por requerimiento exclusivo de Apple, compilar código Swift/Obj-C a binarios `.ipa` o `.app` exige el compilador `xcodebuild` disponible únicamente en **macOS**. 
  - **Solución Automática en la Nube**: Hemos configurado un flujo de trabajo de integración continua en [`.github/workflows/build-mobile.yml`](.github/workflows/build-mobile.yml). Al subir tu repositorio a GitHub, se compilarán automáticamente los instalables tanto de **Android (APK)** como de **iOS (Xcode)** en servidores Mac en la nube sin coste.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Móvil Híbrido**: Capacitor 8, Android Platform, iOS Platform, Plugins Oficiales de Cámara, Preferencias, Barra de Estado, Splash y Toast.
- **Backend**: Node.js, Express, Multer, @google/generative-ai (Gemini 1.5 Flash).
- **Persistencia**: LocalStorage y Capacitor Preferences con sincronización en tiempo real.


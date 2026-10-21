import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Toast } from '@capacitor/toast';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNativePlatform = Capacitor.isNativePlatform();

export async function initializeNativeApp() {
  if (!isNativePlatform) return;

  try {
    // Inicializar StatusBar
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#059669' });
    }

    // Ocultar SplashScreen tras carga inicial
    await SplashScreen.hide();
  } catch (err) {
    console.warn('Error inicializando plugins nativos:', err);
  }
}

export async function showNativeToast(text: string) {
  if (isNativePlatform) {
    try {
      await Toast.show({
        text,
        duration: 'short',
        position: 'bottom',
      });
      return;
    } catch {
      // Fallback si falla
    }
  }
  console.log(`[Toast] ${text}`);
}

export async function takeNativeReceiptPhoto(): Promise<{ file?: File; previewUrl: string } | null> {
  if (isNativePlatform) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        // Convertir a File para el FormData
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `receipt_${Date.now()}.${image.format || 'jpg'}`, {
          type: `image/${image.format || 'jpeg'}`,
        });

        return {
          file,
          previewUrl: image.webPath,
        };
      }
    } catch (err) {
      console.warn('Captura nativa cancelada o fallida:', err);
      return null;
    }
  }

  return null;
}

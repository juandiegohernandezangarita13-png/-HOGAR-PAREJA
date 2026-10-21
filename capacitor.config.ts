import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comprai.app',
  appName: 'ComprAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#10b981',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#059669',
    },
    Camera: {
      // Configuration for native photo capture
    },
  },
};

export default config;

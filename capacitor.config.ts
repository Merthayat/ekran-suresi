import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.olcico.ekransuresi',
  appName: 'Haftalık Ekran Süresi Takibi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'giga-arbor-1thv3.firebaseapp.com',
      '*.firebaseapp.com',
      'accounts.google.com',
    ],
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;

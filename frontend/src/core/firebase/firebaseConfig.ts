import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Vite kullandığımız için environment variable'lar import.meta.env altından okunur
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase uygulamasını başlatır
export const app = initializeApp(firebaseConfig);

// Auth modülünü dışarıya, uygulamada (ör. login sayfasında) kullanılmak üzere aktarır
export const auth = getAuth(app);

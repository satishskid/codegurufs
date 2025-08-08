// filepath: /Users/spr/Downloads/fullstack-version/services/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

export const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length) return getApps()[0]!;

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  } as const;

  return initializeApp(config);
};

export default getFirebaseApp;

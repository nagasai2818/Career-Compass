/// <reference types="vite/client" />
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const googleProvider = new GoogleAuthProvider();

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

export const isFirebaseSetup = Boolean(apiKey && apiKey !== 'undefined');

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Only initialize Firebase when valid credentials exist
let auth: ReturnType<typeof getAuth> | null = null;

if (isFirebaseSetup) {
  try {
    const app = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    auth = getAuth(app);
  } catch (e) {
    console.warn('Firebase initialization failed:', e);
  }
}

export { auth };

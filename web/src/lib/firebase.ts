import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const rawConfig = {
  apiKey: import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const useEmulators = import.meta.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

function looksLikePlaceholder(value?: string) {
  const normalizedValue = value?.trim();
  if (!normalizedValue) {
    return true;
  }

  return [
    'your-api-key',
    'your-project.firebaseapp.com',
    'your-project-id',
    'your-project.firebasestorage.app',
    '1234567890',
    '1:1234567890:web:abcdef123456',
  ].includes(normalizedValue);
}

export const isFirebaseConfigured = Object.values(rawConfig).every(
  (value) => value && (useEmulators || !looksLikePlaceholder(value)),
);

const app = isFirebaseConfigured ? initializeApp(rawConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
const emulatorHost = import.meta.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
const authPort = Number(import.meta.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || 9099);
const firestorePort = Number(
  import.meta.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || 8085,
);

if (useEmulators && auth && db) {
  const flags = window as Window & {
    __siteTrackWebAuthEmulator?: boolean;
    __siteTrackWebFirestoreEmulator?: boolean;
  };

  if (!flags.__siteTrackWebAuthEmulator) {
    connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, {
      disableWarnings: true,
    });
    flags.__siteTrackWebAuthEmulator = true;
  }

  if (!flags.__siteTrackWebFirestoreEmulator) {
    connectFirestoreEmulator(db, emulatorHost, firestorePort);
    flags.__siteTrackWebFirestoreEmulator = true;
  }
}

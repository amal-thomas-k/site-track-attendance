import { getApp, getApps, initializeApp } from 'firebase/app';
import { FirebaseError } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseApp = app;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

const useFirebaseEmulators = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
const firebaseEmulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
const firebaseAuthEmulatorPort = Number(
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || 9099,
);
const firebaseFirestoreEmulatorPort = Number(
  process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || 8085,
);

if (useFirebaseEmulators && auth && db) {
  const emulatorFlags = globalThis as typeof globalThis & {
    __siteTrackAuthEmulatorConnected?: boolean;
    __siteTrackFirestoreEmulatorConnected?: boolean;
  };

  if (!emulatorFlags.__siteTrackAuthEmulatorConnected) {
    connectAuthEmulator(auth, `http://${firebaseEmulatorHost}:${firebaseAuthEmulatorPort}`, {
      disableWarnings: true,
    });
    emulatorFlags.__siteTrackAuthEmulatorConnected = true;
  }

  if (!emulatorFlags.__siteTrackFirestoreEmulatorConnected) {
    connectFirestoreEmulator(db, firebaseEmulatorHost, firebaseFirestoreEmulatorPort);
    emulatorFlags.__siteTrackFirestoreEmulatorConnected = true;
  }
}

export function getFriendlyFirebaseError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.';
  }

  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/network-request-failed':
      return 'Network unavailable. Check your connection and try again.';
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    default:
      return error.message;
  }
}

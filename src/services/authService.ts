import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { auth } from '../config/firebase';

export async function loginWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* values first.');
  }

  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logoutUser() {
  if (!auth) {
    return;
  }

  return signOut(auth);
}

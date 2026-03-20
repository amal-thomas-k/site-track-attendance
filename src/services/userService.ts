import {
  Unsubscribe,
  arrayUnion,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  collection,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { AppUser } from '../types/models';

function mapUser(snapshotId: string, data: Record<string, unknown>): AppUser {
  return {
    id: snapshotId,
    name: String(data.name ?? 'Unnamed User'),
    role: (data.role as AppUser['role']) ?? 'worker',
    assignedSite: typeof data.assignedSite === 'string' ? data.assignedSite : undefined,
    email: typeof data.email === 'string' ? data.email : undefined,
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    fcmTokens: Array.isArray(data.fcmTokens) ? (data.fcmTokens as string[]) : [],
    expoTokens: Array.isArray(data.expoTokens) ? (data.expoTokens as string[]) : [],
  };
}

export function subscribeToCurrentUser(
  userId: string,
  callback: (user: AppUser | null) => void,
) {
  if (!db) {
    callback(null);
    return () => undefined;
  }

  return onSnapshot(doc(db, 'users', userId), (snapshot) => {
    callback(snapshot.exists() ? mapUser(snapshot.id, snapshot.data()) : null);
  });
}

export function subscribeToWorkers(callback: (users: AppUser[]) => void): Unsubscribe {
  if (!db) {
    callback([]);
    return () => undefined;
  }

  return onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'worker')),
    (snapshot) => {
      callback(snapshot.docs.map((docSnapshot) => mapUser(docSnapshot.id, docSnapshot.data())));
    },
  );
}

export async function storeNotificationToken(
  userId: string,
  provider: 'fcm' | 'expo',
  token: string,
) {
  if (!db) {
    return;
  }

  const userRef = doc(db, 'users', userId);
  const fieldName = provider === 'fcm' ? 'fcmTokens' : 'expoTokens';

  await setDoc(
    userRef,
    {
      id: userId,
    },
    { merge: true },
  );

  await updateDoc(userRef, {
    [fieldName]: arrayUnion(token),
  });
}

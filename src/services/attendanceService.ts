import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import {
  Unsubscribe,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { AppUser, AttendanceRecord, AttendanceResult } from '../types/models';
import { getAttendanceId, getDateKey } from '../utils/date';
import {
  getPendingAttendance,
  hasPendingAttendance,
  removePendingAttendance,
  savePendingAttendance,
} from './offlineQueue';

function mapAttendance(snapshotId: string, data: Record<string, unknown>): AttendanceRecord {
  return {
    id: snapshotId,
    userId: String(data.userId),
    workerName: String(data.workerName ?? 'Unknown worker'),
    assignedSite: typeof data.assignedSite === 'string' ? data.assignedSite : undefined,
    timestamp: String(data.timestamp),
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    date: String(data.date),
    syncStatus: 'synced',
  };
}

export function subscribeToWorkerAttendance(
  userId: string,
  callback: (records: AttendanceRecord[]) => void,
): Unsubscribe {
  if (!db) {
    callback([]);
    return () => undefined;
  }

  return onSnapshot(
    query(
      collection(db, 'attendance'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
    ),
    (snapshot) => {
      callback(snapshot.docs.map((item) => mapAttendance(item.id, item.data())));
    },
  );
}

export function subscribeToAttendanceFeed(
  callback: (records: AttendanceRecord[]) => void,
): Unsubscribe {
  if (!db) {
    callback([]);
    return () => undefined;
  }

  return onSnapshot(query(collection(db, 'attendance'), orderBy('timestamp', 'desc')), (snapshot) => {
    callback(snapshot.docs.map((item) => mapAttendance(item.id, item.data())));
  });
}

export async function getTodayAttendanceStatus(userId: string) {
  const dateKey = getDateKey();
  const recordId = getAttendanceId(userId, dateKey);
  const pending = await hasPendingAttendance(recordId);

  if (pending) {
    return { exists: true, pending: true };
  }

  if (!db) {
    return { exists: false, pending: false };
  }

  const existing = await getDoc(doc(db, 'attendance', recordId));
  return { exists: existing.exists(), pending: false };
}

async function persistAttendance(record: AttendanceRecord) {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  const attendanceRef = doc(db, 'attendance', record.id);

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(attendanceRef);
    if (existing.exists()) {
      throw new Error('already-marked');
    }

    transaction.set(attendanceRef, record);
  });
}

async function createAttendanceRecord(user: AppUser) {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Location permission is required to mark attendance.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const timestamp = new Date();
  const date = getDateKey(timestamp);

  return {
    id: getAttendanceId(user.id, date),
    userId: user.id,
    workerName: user.name,
    assignedSite: user.assignedSite ?? 'Unassigned Site',
    timestamp: timestamp.toISOString(),
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    date,
    syncStatus: 'synced',
  } satisfies AttendanceRecord;
}

export async function markAttendance(user: AppUser): Promise<AttendanceResult> {
  const state = await NetInfo.fetch();
  const recordId = getAttendanceId(user.id, getDateKey());
  const pending = await hasPendingAttendance(recordId);

  if (pending) {
    return { status: 'duplicate' };
  }

  const record = await createAttendanceRecord(user);

  if (!state.isConnected || !db) {
    await savePendingAttendance({ ...record, syncStatus: 'pending' });
    return { status: 'queued', record: { ...record, syncStatus: 'pending' } };
  }

  try {
    await persistAttendance(record);
    await removePendingAttendance(record.id);
    return { status: 'synced', record };
  } catch (error) {
    if (error instanceof Error && error.message === 'already-marked') {
      return { status: 'duplicate' };
    }

    throw error;
  }
}

export async function syncPendingAttendance() {
  if (!db) {
    return { synced: 0, duplicates: 0 };
  }

  const pendingQueue = await getPendingAttendance();
  let synced = 0;
  let duplicates = 0;

  for (const record of pendingQueue) {
    try {
      await persistAttendance({ ...record, syncStatus: 'synced' });
      await removePendingAttendance(record.id);
      synced += 1;
    } catch (error) {
      if (error instanceof Error && error.message === 'already-marked') {
        await removePendingAttendance(record.id);
        duplicates += 1;
      }
    }
  }

  return { synced, duplicates };
}

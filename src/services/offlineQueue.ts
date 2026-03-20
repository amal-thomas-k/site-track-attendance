import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storage';
import { AttendanceRecord } from '../types/models';
import { sortAttendanceDescending } from '../utils/date';

export async function getPendingAttendance() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.pendingAttendance);
  if (!raw) {
    return [];
  }

  try {
    return sortAttendanceDescending(JSON.parse(raw) as AttendanceRecord[]);
  } catch {
    return [];
  }
}

export async function savePendingAttendance(record: AttendanceRecord) {
  const queue = await getPendingAttendance();
  const nextQueue = sortAttendanceDescending(
    [...queue.filter((item) => item.id !== record.id), { ...record, syncStatus: 'pending' }],
  );

  await AsyncStorage.setItem(STORAGE_KEYS.pendingAttendance, JSON.stringify(nextQueue));
}

export async function removePendingAttendance(recordId: string) {
  const queue = await getPendingAttendance();
  const nextQueue = queue.filter((item) => item.id !== recordId);
  await AsyncStorage.setItem(STORAGE_KEYS.pendingAttendance, JSON.stringify(nextQueue));
}

export async function getPendingAttendanceForUser(userId: string) {
  const queue = await getPendingAttendance();
  return queue.filter((item) => item.userId === userId);
}

export async function hasPendingAttendance(recordId: string) {
  const queue = await getPendingAttendance();
  return queue.some((item) => item.id === recordId);
}

export type UserRole = 'worker' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  assignedSite?: string;
  email?: string;
  phone?: string;
  fcmTokens?: string[];
  expoTokens?: string[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  workerName: string;
  assignedSite?: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  date: string;
  syncStatus?: 'pending' | 'synced';
}

export interface AttendanceResult {
  status: 'synced' | 'queued' | 'duplicate';
  record?: AttendanceRecord;
}

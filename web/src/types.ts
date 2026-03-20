export type UserRole = 'worker' | 'admin';
export type UserMode = 'firebase' | 'demo';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  assignedSite: string;
  email?: string;
  phone?: string;
  trade?: string;
  zone?: string;
  shift?: string;
  availabilityStatus?: 'active' | 'on_leave' | 'off_shift';
}

export interface SessionUser extends AppUser {
  mode: UserMode;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  workerName: string;
  assignedSite: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  date: string;
}

export interface AppSettings {
  lateCutoffTime: string;
  defaultSite: string;
  liveFeedEnabled: boolean;
  weatherSummary: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  relatedAttendanceId?: string;
}

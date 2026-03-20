import { AttendanceRecord, AppSettings, AppUser } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  lateCutoffTime: '09:30',
  defaultSite: 'All Sites',
  liveFeedEnabled: true,
  weatherSummary: 'Partly Cloudy · 24°C',
};

export function todayKey(date: Date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function attendanceId(userId: string, dateKey: string) {
  return `${userId}_${dateKey}`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  const date = new Date(value);
  return `${formatDate(date)} · ${formatTime(date)}`;
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function mapUrl(latitude: number, longitude: number) {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

export function toDateTime(dateKey: string, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(`${dateKey}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function isLate(record: AttendanceRecord, cutoffTime: string) {
  const [hours, minutes] = cutoffTime.split(':').map(Number);
  const cutoff = new Date(`${record.date}T00:00:00`);
  cutoff.setHours(hours, minutes, 0, 0);
  return new Date(record.timestamp).getTime() > cutoff.getTime();
}

export function getSiteOptions(users: AppUser[], attendance: AttendanceRecord[]) {
  const values = new Set<string>(['All Sites']);
  users.forEach((user) => values.add(user.assignedSite));
  attendance.forEach((record) => values.add(record.assignedSite));
  return [...values];
}

export function sortByLatest<T extends { timestamp: string }>(items: T[]) {
  return [...items].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function csvEscape(value: string | number) {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function createCsv(rows: Array<Array<string | number>>) {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function createNotificationBody(record: AttendanceRecord) {
  return `${record.workerName} checked in at ${formatTime(record.timestamp)} from ${formatCoordinates(
    record.latitude,
    record.longitude,
  )}`;
}

export function attendancePercentage(presentCount: number, totalCount: number) {
  if (!totalCount) {
    return 0;
  }
  return Math.round((presentCount / totalCount) * 100);
}

export function getStatusTone(status?: AppUser['availabilityStatus']) {
  switch (status) {
    case 'active':
      return 'good';
    case 'on_leave':
      return 'warn';
    case 'off_shift':
      return 'bad';
    default:
      return 'neutral';
  }
}

export function humanizeAvailability(status?: AppUser['availabilityStatus']) {
  switch (status) {
    case 'active':
      return 'Active';
    case 'on_leave':
      return 'On Leave';
    case 'off_shift':
      return 'Off Shift';
    default:
      return 'Unknown';
  }
}

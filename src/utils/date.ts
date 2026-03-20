import { format, isAfter, startOfDay } from 'date-fns';

import { AttendanceRecord } from '../types/models';

export function getDateKey(date: Date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(value: string | Date) {
  return format(new Date(value), 'dd MMM yyyy');
}

export function formatDisplayTime(value: string | Date) {
  return format(new Date(value), 'hh:mm a');
}

export function formatDisplayDateTime(value: string | Date) {
  return format(new Date(value), 'dd MMM yyyy, hh:mm a');
}

export function getAttendanceId(userId: string, dateKey: string) {
  return `${userId}_${dateKey}`;
}

export function isLate(record: AttendanceRecord, dateKey: string, cutoffTime = '09:30') {
  const [hours, minutes] = cutoffTime.split(':').map(Number);
  const cutoff = startOfDay(new Date(dateKey));
  cutoff.setHours(hours, minutes, 0, 0);
  return isAfter(new Date(record.timestamp), cutoff);
}

export function sortAttendanceDescending(records: AttendanceRecord[]) {
  return [...records].sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

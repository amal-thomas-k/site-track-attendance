import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StatusPill } from '../../components/StatusPill';
import { palette, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToWorkerAttendance } from '../../services/attendanceService';
import { getPendingAttendanceForUser } from '../../services/offlineQueue';
import { AttendanceRecord } from '../../types/models';
import { sortAttendanceDescending, formatDisplayDate, formatDisplayTime } from '../../utils/date';
import { buildMapsLink, formatCoordinates } from '../../utils/location';

export function WorkerHistoryScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [pending, setPending] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    const loadPending = async () => {
      const pendingRecords = await getPendingAttendanceForUser(user.id);
      if (mounted) {
        setPending(pendingRecords);
      }
    };

    loadPending();
    const unsubscribe = subscribeToWorkerAttendance(user.id, setHistory);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

  const records = useMemo(() => {
    const merged = [...history, ...pending.filter((record) => !history.some((item) => item.id === record.id))];
    return sortAttendanceDescending(merged);
  }, [history, pending]);

  if (!user) {
    return null;
  }

  return (
    <Screen title="Attendance History" subtitle="Your previous check-ins with time and location">
      {records.length === 0 ? (
        <EmptyState
          title="No attendance records yet"
          description="Once you mark attendance, your history will appear here."
        />
      ) : (
        records.map((record) => (
          <SectionCard key={record.id}>
            <View style={styles.row}>
              <View>
                <Text style={styles.date}>{formatDisplayDate(record.timestamp)}</Text>
                <Text style={styles.time}>{formatDisplayTime(record.timestamp)}</Text>
              </View>
              <StatusPill
                label={record.syncStatus === 'pending' ? 'Pending Sync' : 'Synced'}
                tone={record.syncStatus === 'pending' ? 'warn' : 'good'}
              />
            </View>
            <Text style={styles.site}>{record.assignedSite ?? 'Unassigned Site'}</Text>
            <Pressable onPress={() => Linking.openURL(buildMapsLink(record.latitude, record.longitude))}>
              <Text style={styles.location}>{formatCoordinates(record.latitude, record.longitude)}</Text>
              <Text style={styles.link}>Open in Maps</Text>
            </Pressable>
          </SectionCard>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  time: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 14,
    marginTop: 2,
  },
  site: {
    color: palette.accentDeep,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  location: {
    color: palette.ink,
    fontFamily: typography.body,
    fontSize: 14,
  },
  link: {
    color: palette.highlight,
    fontFamily: typography.heading,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});

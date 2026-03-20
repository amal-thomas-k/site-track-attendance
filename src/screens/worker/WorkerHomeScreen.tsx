import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StatusPill } from '../../components/StatusPill';
import { palette, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import {
  getTodayAttendanceStatus,
  markAttendance,
  subscribeToWorkerAttendance,
} from '../../services/attendanceService';
import { getPendingAttendanceForUser } from '../../services/offlineQueue';
import { AttendanceRecord } from '../../types/models';
import { formatCoordinates } from '../../utils/location';
import { formatDisplayDateTime, getDateKey } from '../../utils/date';

export function WorkerHomeScreen() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [pending, setPending] = useState<AttendanceRecord[]>([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [screenLoading, setScreenLoading] = useState(true);

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
    const unsubscribe = subscribeToWorkerAttendance(user.id, (records) => {
      setHistory(records);
      setScreenLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

  const todaysRecord = useMemo(() => {
    const today = getDateKey();
    return [...pending, ...history].find((record) => record.date === today);
  }, [history, pending]);

  const handleMarkAttendance = async () => {
    if (!user) {
      return;
    }

    setStatusMessage(null);
    setCheckingIn(true);

    try {
      const result = await markAttendance(user);
      const refreshedPending = await getPendingAttendanceForUser(user.id);
      setPending(refreshedPending);

      if (result.status === 'duplicate') {
        const status = await getTodayAttendanceStatus(user.id);
        setStatusMessage(
          status.pending
            ? 'Attendance already saved offline for today. It will sync when internet is available.'
            : 'Attendance already marked for today.',
        );
      } else if (result.status === 'queued') {
        setStatusMessage('Attendance saved offline. It will sync automatically when the device reconnects.');
      } else {
        setStatusMessage('Attendance marked successfully.');
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to mark attendance.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Screen
      title={`Hello, ${user.name.split(' ')[0]}`}
      subtitle={`Assigned site: ${user.assignedSite ?? 'Unassigned Site'}`}
    >
      <SectionCard>
        <View style={styles.statusHeader}>
          <Text style={styles.cardTitle}>Today&apos;s Check-in</Text>
          {todaysRecord ? (
            <StatusPill
              label={todaysRecord.syncStatus === 'pending' ? 'Pending Sync' : 'Present'}
              tone={todaysRecord.syncStatus === 'pending' ? 'warn' : 'good'}
            />
          ) : (
            <StatusPill label="Not Marked" tone="bad" />
          )}
        </View>

        {todaysRecord ? (
          <>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{formatDisplayDateTime(todaysRecord.timestamp)}</Text>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {formatCoordinates(todaysRecord.latitude, todaysRecord.longitude)}
            </Text>
          </>
        ) : (
          <EmptyState
            title="Attendance not marked yet"
            description="Press the large button below after reaching your construction site."
          />
        )}

        {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

        <PrimaryButton
          disabled={Boolean(todaysRecord)}
          label={todaysRecord ? 'Attendance Already Marked' : 'Mark Attendance'}
          loading={checkingIn}
          onPress={handleMarkAttendance}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.cardTitle}>Quick Overview</Text>
        {screenLoading ? (
          <ActivityIndicator color={palette.accent} />
        ) : (
          <>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Attendance records</Text>
              <Text style={styles.metricValue}>{history.length + pending.length}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Pending offline sync</Text>
              <Text style={styles.metricValue}>{pending.length}</Text>
            </View>
          </>
        )}
      </SectionCard>

      <PrimaryButton label="Log Out" onPress={() => logout()} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 20,
    fontWeight: '700',
  },
  infoLabel: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 13,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  statusMessage: {
    color: palette.highlight,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metricLabel: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 15,
  },
  metricValue: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
});

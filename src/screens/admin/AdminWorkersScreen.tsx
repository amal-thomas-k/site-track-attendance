import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StatusPill } from '../../components/StatusPill';
import { palette, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToAttendanceFeed } from '../../services/attendanceService';
import { subscribeToWorkers } from '../../services/userService';
import { AppUser, AttendanceRecord } from '../../types/models';
import { formatDisplayDateTime, getDateKey } from '../../utils/date';

export function AdminWorkersScreen() {
  const { logout } = useAuth();
  const [workers, setWorkers] = useState<AppUser[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const unsubscribeWorkers = subscribeToWorkers(setWorkers);
    const unsubscribeAttendance = subscribeToAttendanceFeed(setAttendance);

    return () => {
      unsubscribeWorkers();
      unsubscribeAttendance();
    };
  }, []);

  const todayMap = useMemo(() => {
    const today = getDateKey();
    return attendance.reduce<Record<string, AttendanceRecord>>((accumulator, record) => {
      if (record.date === today && !accumulator[record.userId]) {
        accumulator[record.userId] = record;
      }
      return accumulator;
    }, {});
  }, [attendance]);

  return (
    <Screen title="Workers" subtitle="Roster view for current worker status and assigned sites">
      {workers.length === 0 ? (
        <EmptyState
          title="No workers found"
          description="Add worker profiles in the Firestore users collection to populate this list."
        />
      ) : (
        workers.map((worker) => {
          const todayRecord = todayMap[worker.id];
          return (
            <SectionCard key={worker.id}>
              <View style={styles.row}>
                <View style={styles.meta}>
                  <Text style={styles.name}>{worker.name}</Text>
                  <Text style={styles.site}>{worker.assignedSite ?? 'Unassigned Site'}</Text>
                  <Text style={styles.detail}>{worker.email ?? worker.phone ?? 'No contact saved'}</Text>
                  {todayRecord ? (
                    <Text style={styles.detail}>{formatDisplayDateTime(todayRecord.timestamp)}</Text>
                  ) : null}
                </View>
                <StatusPill label={todayRecord ? 'Present' : 'Absent'} tone={todayRecord ? 'good' : 'bad'} />
              </View>
            </SectionCard>
          );
        })
      )}

      <PrimaryButton label="Log Out" onPress={() => logout()} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    flex: 1,
    gap: 4,
    paddingRight: spacing.md,
  },
  name: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  site: {
    color: palette.accentDeep,
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  detail: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 13,
  },
});

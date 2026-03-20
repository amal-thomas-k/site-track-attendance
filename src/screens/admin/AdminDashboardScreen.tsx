import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateFilter } from '../../components/DateFilter';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { StatusPill } from '../../components/StatusPill';
import { SummaryCard } from '../../components/SummaryCard';
import { palette, radius, spacing, typography } from '../../constants/theme';
import { subscribeToAttendanceFeed } from '../../services/attendanceService';
import { subscribeToWorkers } from '../../services/userService';
import { AppUser, AttendanceRecord } from '../../types/models';
import { formatDisplayTime, getDateKey, isLate } from '../../utils/date';
import { formatCoordinates } from '../../utils/location';

const DEFAULT_SITE = 'All Sites';

export function AdminDashboardScreen() {
  const [workers, setWorkers] = useState<AppUser[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [siteFilter, setSiteFilter] = useState(DEFAULT_SITE);

  useEffect(() => {
    const unsubscribeWorkers = subscribeToWorkers(setWorkers);
    const unsubscribeAttendance = subscribeToAttendanceFeed(setAttendance);

    return () => {
      unsubscribeWorkers();
      unsubscribeAttendance();
    };
  }, []);

  const siteOptions = useMemo(
    () =>
      [DEFAULT_SITE, ...new Set(workers.map((worker) => worker.assignedSite ?? 'Unassigned Site'))],
    [workers],
  );

  const filteredWorkers = useMemo(
    () =>
      siteFilter === DEFAULT_SITE
        ? workers
        : workers.filter((worker) => (worker.assignedSite ?? 'Unassigned Site') === siteFilter),
    [siteFilter, workers],
  );

  const todaysAttendance = useMemo(
    () =>
      attendance.filter(
        (record) =>
          record.date === selectedDate &&
          (siteFilter === DEFAULT_SITE || (record.assignedSite ?? 'Unassigned Site') === siteFilter),
      ),
    [attendance, selectedDate, siteFilter],
  );

  const presentIds = useMemo(() => new Set(todaysAttendance.map((record) => record.userId)), [todaysAttendance]);

  const absentWorkers = filteredWorkers.filter((worker) => !presentIds.has(worker.id));
  const lateArrivals = todaysAttendance.filter((record) => isLate(record, selectedDate));
  const attendancePercent = filteredWorkers.length
    ? Math.round((presentIds.size / filteredWorkers.length) * 100)
    : 0;

  const workerAttendanceCounts = useMemo(
    () =>
      filteredWorkers
        .map((worker) => ({
          id: worker.id,
          name: worker.name,
          count: attendance.filter(
            (record) =>
              record.userId === worker.id &&
              (siteFilter === DEFAULT_SITE || (record.assignedSite ?? 'Unassigned Site') === siteFilter),
          ).length,
        }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 6),
    [attendance, filteredWorkers, siteFilter],
  );

  return (
    <Screen title="Attendance Dashboard" subtitle="Live site status, filters, and basic workforce analytics">
      <DateFilter onChange={setSelectedDate} value={selectedDate} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {siteOptions.map((site) => {
            const selected = site === siteFilter;
            return (
              <Text
                key={site}
                onPress={() => setSiteFilter(site)}
                style={[styles.siteChip, selected && styles.siteChipActive]}
              >
                {site}
              </Text>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.summaryGrid}>
        <SummaryCard accent={palette.accent} label="Total workers" value={String(filteredWorkers.length)} />
        <SummaryCard accent={palette.signalGood} label="Present today" value={String(presentIds.size)} />
        <SummaryCard accent={palette.signalBad} label="Absent today" value={String(absentWorkers.length)} />
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>Daily Analytics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Attendance percentage</Text>
          <Text style={styles.metricValue}>{attendancePercent}%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Late arrivals after 9:30 AM</Text>
          <Text style={styles.metricValue}>{lateArrivals.length}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Attendance List</Text>
        {todaysAttendance.length === 0 ? (
          <EmptyState
            title="No check-ins for this filter"
            description="Try another date or site to review attendance activity."
          />
        ) : (
          todaysAttendance.map((record) => (
            <View key={record.id} style={styles.listRow}>
              <View style={styles.listMeta}>
                <Text style={styles.workerName}>{record.workerName}</Text>
                <Text style={styles.workerDetail}>{formatDisplayTime(record.timestamp)}</Text>
                <Text style={styles.workerDetail}>{formatCoordinates(record.latitude, record.longitude)}</Text>
              </View>
              <StatusPill label="Present" tone="good" />
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Worker-wise Attendance Count</Text>
        {workerAttendanceCounts.length === 0 ? (
          <EmptyState
            title="No attendance data yet"
            description="Counts will populate once workers start checking in."
          />
        ) : (
          workerAttendanceCounts.map((worker) => (
            <View key={worker.id} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{worker.name}</Text>
              <Text style={styles.metricValue}>{worker.count}</Text>
            </View>
          ))
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  siteChip: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.pill,
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  siteChipActive: {
    backgroundColor: palette.accent,
    color: palette.white,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 20,
    fontWeight: '700',
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: palette.inkSoft,
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    paddingRight: spacing.sm,
  },
  metricValue: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  listRow: {
    alignItems: 'center',
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  listMeta: {
    flex: 1,
    gap: 4,
    paddingRight: spacing.md,
  },
  workerName: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  workerDetail: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 13,
  },
});

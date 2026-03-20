import { CalendarDays, MapPinned } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { StatCard } from '../../components/StatCard';
import { useAppData } from '../../context/AppDataContext';
import {
  attendancePercentage,
  formatCoordinates,
  formatTime,
  getSiteOptions,
  isLate,
  todayKey,
} from '../../lib/utils';

export function AdminDashboardPage() {
  const { attendance, settings, workers } = useAppData();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [siteFilter, setSiteFilter] = useState('All Sites');

  const siteOptions = useMemo(() => getSiteOptions(workers, attendance), [attendance, workers]);

  const filteredWorkers = useMemo(
    () =>
      siteFilter === 'All Sites'
        ? workers
        : workers.filter((worker) => worker.assignedSite === siteFilter),
    [siteFilter, workers],
  );

  const filteredAttendance = useMemo(
    () =>
      attendance.filter(
        (record) =>
          record.date === selectedDate &&
          (siteFilter === 'All Sites' || record.assignedSite === siteFilter),
      ),
    [attendance, selectedDate, siteFilter],
  );

  const presentIds = new Set(filteredAttendance.map((record) => record.userId));
  const lateCount = filteredAttendance.filter((record) => isLate(record, settings.lateCutoffTime)).length;
  const absentCount = Math.max(filteredWorkers.length - presentIds.size, 0);

  return (
    <Shell title="Main Dashboard" subtitle={settings.weatherSummary}>
      <div className="stack">
        <Panel>
          <div className="toolbar toolbar--filters">
            <label className="filter-field">
              <CalendarDays size={16} />
              <input
                max={todayKey()}
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
              />
            </label>

            <label className="filter-field">
              <MapPinned size={16} />
              <select onChange={(event) => setSiteFilter(event.target.value)} value={siteFilter}>
                {siteOptions.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Panel>

        <div className="stat-grid">
          <StatCard label="Total Workers" value={filteredWorkers.length} />
          <StatCard
            accent="blue"
            label="Present Today"
            value={presentIds.size}
            helper={<Badge tone="good">{attendancePercentage(presentIds.size, filteredWorkers.length)}%</Badge>}
          />
          <StatCard
            accent="red"
            label="Absent Today"
            value={absentCount}
            helper={<Badge tone={lateCount ? 'warn' : 'neutral'}>{lateCount} late</Badge>}
          />
        </div>

        <Panel>
          <div className="panel__heading">
            <h3>Recent Activity</h3>
            <Badge tone="good">Live Feed</Badge>
          </div>

          {filteredAttendance.length === 0 ? (
            <EmptyState
              title="No check-ins for this date"
              description="Change the site or date filter to review other attendance records."
            />
          ) : (
            <div className="table-list">
              {filteredAttendance.slice(0, 8).map((record) => (
                <article className="table-list__row" key={record.id}>
                  <div className="table-list__primary">
                    <strong>{record.workerName}</strong>
                    <span>{record.assignedSite}</span>
                  </div>
                  <div className="table-list__meta">
                    <span>{formatTime(record.timestamp)}</span>
                    <span>{formatCoordinates(record.latitude, record.longitude)}</span>
                  </div>
                  <Badge tone={isLate(record, settings.lateCutoffTime) ? 'warn' : 'good'}>
                    {isLate(record, settings.lateCutoffTime) ? 'Late' : 'Present'}
                  </Badge>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </Shell>
  );
}

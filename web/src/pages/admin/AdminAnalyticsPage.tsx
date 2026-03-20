import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { attendancePercentage, formatDate, isLate, todayKey } from '../../lib/utils';

export function AdminAnalyticsPage() {
  const { attendance, settings, workers } = useAppData();

  const dailySeries = useMemo(() => {
    const map = new Map<string, Set<string>>();
    attendance.forEach((record) => {
      const current = map.get(record.date) ?? new Set<string>();
      current.add(record.userId);
      map.set(record.date, current);
    });

    return [...map.entries()]
      .map(([date, present]) => ({
        date: formatDate(date),
        percentage: attendancePercentage(present.size, workers.length),
      }))
      .slice(-7);
  }, [attendance, workers.length]);

  const workerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    attendance.forEach((record) => {
      counts.set(record.workerName, (counts.get(record.workerName) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);
  }, [attendance]);

  const todayLate = attendance.filter((record) => record.date === todayKey() && isLate(record, settings.lateCutoffTime));

  return (
    <Shell title="Detailed Analytics" subtitle="Daily attendance percentage, late arrivals, and worker-wise counts">
      <div className="analytics-grid">
        <Panel>
          <div className="panel__heading">
            <h3>Attendance Percentage</h3>
            <Badge tone="neutral">Last 7 days</Badge>
          </div>
          {dailySeries.length === 0 ? (
            <EmptyState title="No analytics yet" description="Attendance data will populate this chart." />
          ) : (
            <div className="chart-frame">
              <ResponsiveContainer height={280} width="100%">
                <LineChart data={dailySeries}>
                  <CartesianGrid stroke="rgba(86, 67, 52, 0.25)" vertical={false} />
                  <XAxis dataKey="date" stroke="#ddc1ae" />
                  <YAxis stroke="#ddc1ae" />
                  <Tooltip />
                  <Line dataKey="percentage" stroke="#ff8c00" strokeWidth={3} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="panel__heading">
            <h3>Worker-Wise Attendance Count</h3>
            <Badge tone="good">{workerCounts.length} tracked</Badge>
          </div>
          {workerCounts.length === 0 ? (
            <EmptyState title="No worker counts" description="No attendance data found." />
          ) : (
            <div className="chart-frame">
              <ResponsiveContainer height={280} width="100%">
                <BarChart data={workerCounts}>
                  <CartesianGrid stroke="rgba(86, 67, 52, 0.25)" vertical={false} />
                  <XAxis dataKey="name" stroke="#ddc1ae" />
                  <YAxis stroke="#ddc1ae" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#85cfff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="panel__heading">
            <h3>Late Arrivals Today</h3>
            <Badge tone={todayLate.length ? 'warn' : 'good'}>{todayLate.length}</Badge>
          </div>
          {todayLate.length === 0 ? (
            <EmptyState title="No late arrivals" description="All current check-ins are within the configured cutoff." />
          ) : (
            <div className="table-list">
              {todayLate.map((record) => (
                <article className="table-list__row" key={record.id}>
                  <div className="table-list__primary">
                    <strong>{record.workerName}</strong>
                    <span>{record.assignedSite}</span>
                  </div>
                  <Badge tone="warn">{record.timestamp.slice(11, 16)}</Badge>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </Shell>
  );
}

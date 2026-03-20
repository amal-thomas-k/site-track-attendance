import { Download } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '../../components/Badge';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { attendancePercentage, createCsv, downloadTextFile, formatDate } from '../../lib/utils';

export function AdminReportsPage() {
  const { attendance, workers } = useAppData();

  const groupedBySite = useMemo(() => {
    const map = new Map<string, { site: string; count: number; workers: Set<string>; latest: string }>();

    attendance.forEach((record) => {
      const current = map.get(record.assignedSite) ?? {
        site: record.assignedSite,
        count: 0,
        workers: new Set<string>(),
        latest: record.timestamp,
      };

      current.count += 1;
      current.workers.add(record.userId);
      if (new Date(record.timestamp).getTime() > new Date(current.latest).getTime()) {
        current.latest = record.timestamp;
      }
      map.set(record.assignedSite, current);
    });

    return [...map.values()].sort((left, right) => right.count - left.count);
  }, [attendance]);

  const handleExport = () => {
    const csv = createCsv([
      ['Site', 'Attendance Count', 'Unique Workers', 'Latest Check-In'],
      ...groupedBySite.map((item) => [item.site, item.count, item.workers.size, formatDate(item.latest)]),
    ]);

    downloadTextFile('site-reports.csv', csv);
  };

  return (
    <Shell title="Site Reports" subtitle="Operational site summaries and exportable attendance snapshots">
      <Panel>
        <div className="toolbar">
          <div>
            <h3>Generated Reports</h3>
            <p className="muted-copy">Summaries are based on the currently stored attendance records.</p>
          </div>
          <button className="primary-button primary-button--compact" onClick={handleExport} type="button">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </Panel>

      <div className="report-grid">
        {groupedBySite.map((site) => (
          <Panel key={site.site}>
            <div className="panel__heading">
              <h3>{site.site}</h3>
              <Badge tone="good">{attendancePercentage(site.workers.size, workers.length)}%</Badge>
            </div>
            <div className="metric-list">
              <div>
                <span>Attendance count</span>
                <strong>{site.count}</strong>
              </div>
              <div>
                <span>Unique workers</span>
                <strong>{site.workers.size}</strong>
              </div>
              <div>
                <span>Latest activity</span>
                <strong>{formatDate(site.latest)}</strong>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </Shell>
  );
}

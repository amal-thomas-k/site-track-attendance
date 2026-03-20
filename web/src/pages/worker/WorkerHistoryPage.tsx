import { ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { formatCoordinates, formatDate, formatTime, mapUrl } from '../../lib/utils';

export function WorkerHistoryPage() {
  const { attendance } = useAppData();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      attendance.filter((record) => {
        const target = `${record.assignedSite} ${record.date} ${record.workerName}`.toLowerCase();
        return target.includes(query.toLowerCase());
      }),
    [attendance, query],
  );

  return (
    <Shell title="Attendance History" subtitle="Review previous check-ins, timestamps, and map links">
      <Panel>
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by site or date"
              value={query}
            />
          </label>
          <Badge tone="neutral">{filtered.length} records</Badge>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No history found"
            description="Try a different search term or mark attendance to create a record."
          />
        ) : (
          <div className="history-list">
            {filtered.map((record) => (
              <article className="history-item" key={record.id}>
                <div>
                  <p className="history-item__date">{formatDate(record.timestamp)}</p>
                  <p className="history-item__time">{formatTime(record.timestamp)}</p>
                </div>
                <div className="history-item__meta">
                  <strong>{record.assignedSite}</strong>
                  <span>{formatCoordinates(record.latitude, record.longitude)}</span>
                </div>
                <a className="icon-link" href={mapUrl(record.latitude, record.longitude)} rel="noreferrer" target="_blank">
                  <ExternalLink size={16} />
                  <span>Open</span>
                </a>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </Shell>
  );
}

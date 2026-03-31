import { ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { formatCoordinates, formatDate, formatDateTime, formatTime, mapUrl } from '../../lib/utils';

export function WorkerHistoryPage() {
  const { attendance, loginLogs } = useAppData();
  const [query, setQuery] = useState('');

  const filteredAttendance = useMemo(
    () =>
      attendance.filter((record) => {
        const target = `${record.assignedSite} ${record.date} ${record.workerName}`.toLowerCase();
        return target.includes(query.toLowerCase());
      }),
    [attendance, query],
  );

  const filteredLoginLogs = useMemo(
    () =>
      loginLogs.filter((record) => {
        const actionLabel = record.action === 'sign_up' ? 'account created' : 'signed in';
        const target = `${record.email} ${record.action} ${actionLabel} ${record.timestamp}`.toLowerCase();
        return target.includes(query.toLowerCase());
      }),
    [loginLogs, query],
  );

  return (
    <Shell title="Attendance History" subtitle="Review attendance records and account access activity">
      <Panel>
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by site, date, email, or activity"
              value={query}
            />
          </label>
          <Badge tone="neutral">{filteredAttendance.length} attendance records</Badge>
        </div>

        {filteredAttendance.length === 0 ? (
          <EmptyState
            title="No history found"
            description="Try a different search term or mark attendance to create a record."
          />
        ) : (
          <div className="history-list">
            {filteredAttendance.map((record) => (
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

      <Panel>
        <div className="panel__heading">
          <h3>Account Access Logs</h3>
          <Badge tone="neutral">{filteredLoginLogs.length} entries</Badge>
        </div>

        {filteredLoginLogs.length === 0 ? (
          <EmptyState
            title="No access logs yet"
            description="Your account sign-up and future sign-ins will appear here."
          />
        ) : (
          <div className="table-list">
            {filteredLoginLogs.map((record) => (
              <article className="table-list__row" key={record.id}>
                <div className="table-list__primary">
                  <strong>{record.action === 'sign_up' ? 'Account Created' : 'Signed In'}</strong>
                  <span>{record.email}</span>
                </div>
                <div className="table-list__meta">
                  <span>{formatDateTime(record.timestamp)}</span>
                  <span>{record.source.toUpperCase()}</span>
                </div>
                <Badge tone={record.action === 'sign_up' ? 'warn' : 'good'}>
                  <ShieldCheck size={14} />
                  <span>{record.action === 'sign_up' ? 'New Account' : 'Login'}</span>
                </Badge>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </Shell>
  );
}

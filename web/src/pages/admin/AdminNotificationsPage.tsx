import { Bell, CheckCheck } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { createNotificationBody, formatDateTime } from '../../lib/utils';

export function AdminNotificationsPage() {
  const { attendance, markAllNotificationsRead, markNotificationRead, readNotificationIds } = useAppData();

  const notifications = useMemo(
    () =>
      attendance.slice(0, 20).map((record) => ({
        id: record.id,
        title: `${record.workerName} checked in`,
        body: createNotificationBody(record),
        timestamp: record.timestamp,
      })),
    [attendance],
  );

  const unreadIds = notifications.filter((item) => !readNotificationIds.includes(item.id)).map((item) => item.id);

  return (
    <Shell title="Admin Notifications" subtitle="Attendance alerts generated from recent check-ins">
      <Panel>
        <div className="toolbar">
          <div>
            <h3>Notification Feed</h3>
            <p className="muted-copy">Use this view as the operational alert center for recent arrivals.</p>
          </div>
          <button
            className="secondary-button"
            disabled={!unreadIds.length}
            onClick={() => markAllNotificationsRead(unreadIds)}
            type="button"
          >
            <CheckCheck size={16} />
            <span>Mark All Read</span>
          </button>
        </div>
      </Panel>

      <Panel>
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" description="New attendance check-ins will appear here." />
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => {
              const isRead = readNotificationIds.includes(notification.id);
              return (
                <button
                  className={`notification-item ${isRead ? 'notification-item--read' : ''}`}
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  type="button"
                >
                  <div className="notification-item__icon">
                    <Bell size={18} />
                  </div>
                  <div className="notification-item__body">
                    <div className="notification-item__header">
                      <strong>{notification.title}</strong>
                      <Badge tone={isRead ? 'neutral' : 'good'}>{isRead ? 'Read' : 'New'}</Badge>
                    </div>
                    <p>{notification.body}</p>
                    <span>{formatDateTime(notification.timestamp)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Panel>
    </Shell>
  );
}

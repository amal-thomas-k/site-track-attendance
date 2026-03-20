import { Fingerprint, MapPinned, TimerReset, Wifi } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCoordinates, formatDateTime, mapUrl, todayKey } from '../../lib/utils';

export function WorkerHomePage() {
  const { user } = useAuth();
  const { attendance, dataLoading, markAttendance, settings } = useAppData();
  const [statusMessage, setStatusMessage] = useState('');
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();

  const todayRecord = useMemo(
    () => attendance.find((item) => item.date === todayKey()),
    [attendance],
  );

  if (!user) {
    return null;
  }

  const handleMarkAttendance = async () => {
    setStatusMessage('');
    setMarking(true);

    try {
      const coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not available in this browser.'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          () => reject(new Error('Location permission is required to mark attendance.')),
          {
            enableHighAccuracy: true,
            timeout: 15000,
          },
        );
      });

      const result = await markAttendance(coords);
      if (result.status === 'duplicate') {
        setStatusMessage('Attendance has already been marked for today.');
        return;
      }

      if (result.record) {
        navigate('/worker/success', {
          state: {
            attendanceId: result.record.id,
          },
        });
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to mark attendance.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <Shell title="Worker Check-In" subtitle={`Active Project Site · ${user.assignedSite}`}>
      <div className="page-grid page-grid--worker">
        <Panel className="hero-panel">
          <div className="hero-panel__status">
            <div>
              <p className="eyebrow">
                <MapPinned size={14} />
                <span>Active Project Site</span>
              </p>
              <h3>{user.assignedSite}</h3>
            </div>
            <div className="signal-card">
              <Wifi size={16} />
              <div>
                <span>GPS Status</span>
                <strong>Location Ready</strong>
              </div>
            </div>
          </div>

          {todayRecord ? (
            <div className="success-banner">
              <div className="success-banner__icon">✓</div>
              <div>
                <h4>Good morning, {user.name.split(' ')[0]}!</h4>
                <p>
                  You checked in at <strong>{formatDateTime(todayRecord.timestamp)}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Attendance not marked yet"
              description="Use the check-in button after you arrive at the assigned site."
            />
          )}

          <div className="checkin-panel">
            <button
              className="checkin-button"
              disabled={marking || Boolean(todayRecord)}
              onClick={handleMarkAttendance}
              type="button"
            >
              <Fingerprint size={56} />
              <span>{marking ? 'Verifying...' : 'Mark Attendance'}</span>
              <small>{todayRecord ? 'Already marked today' : 'Click to verify location'}</small>
            </button>
          </div>

          {statusMessage ? <div className="inline-alert inline-alert--warn">{statusMessage}</div> : null}
        </Panel>

        <div className="stack">
          <Panel>
            <div className="panel__heading">
              <h3>Shift Snapshot</h3>
              <Badge tone={todayRecord ? 'good' : 'warn'}>{todayRecord ? 'Present' : 'Pending'}</Badge>
            </div>

            <div className="metric-list">
              <div>
                <span>Assigned zone</span>
                <strong>{user.zone ?? 'Main Access'}</strong>
              </div>
              <div>
                <span>Shift</span>
                <strong>{user.shift ?? '08:00 - 16:00'}</strong>
              </div>
              <div>
                <span>Late cutoff</span>
                <strong>{settings.lateCutoffTime}</strong>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="panel__heading">
              <h3>Latest check-in</h3>
              <Badge tone="neutral">{dataLoading ? 'Loading' : `${attendance.length} records`}</Badge>
            </div>

            {todayRecord ? (
              <div className="location-card">
                <div className="location-card__row">
                  <TimerReset size={18} />
                  <div>
                    <span>Time</span>
                    <strong>{formatDateTime(todayRecord.timestamp)}</strong>
                  </div>
                </div>
                <div className="location-card__row">
                  <MapPinned size={18} />
                  <div>
                    <span>Location</span>
                    <a href={mapUrl(todayRecord.latitude, todayRecord.longitude)} rel="noreferrer" target="_blank">
                      {formatCoordinates(todayRecord.latitude, todayRecord.longitude)}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted-copy">No check-in recorded for today yet.</p>
            )}
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

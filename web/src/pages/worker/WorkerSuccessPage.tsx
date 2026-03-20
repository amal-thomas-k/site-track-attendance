import { CheckCircle2, MapPinned } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { formatCoordinates, formatDateTime, mapUrl, todayKey } from '../../lib/utils';

export function WorkerSuccessPage() {
  const { attendance } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const record =
    attendance.find((item) => item.id === (location.state as { attendanceId?: string } | null)?.attendanceId) ||
    attendance.find((item) => item.date === todayKey());

  if (!record) {
    return <Navigate replace to="/worker/check-in" />;
  }

  return (
    <Shell title="Attendance Marked" subtitle="Verification complete">
      <Panel className="success-screen">
        <div className="success-screen__icon">
          <CheckCircle2 size={72} />
        </div>
        <h3>Attendance marked successfully</h3>
        <p>Your check-in has been stored with timestamp and GPS coordinates.</p>

        <div className="success-screen__summary">
          <div>
            <span>Time</span>
            <strong>{formatDateTime(record.timestamp)}</strong>
          </div>
          <div>
            <span>Location</span>
            <a href={mapUrl(record.latitude, record.longitude)} rel="noreferrer" target="_blank">
              <MapPinned size={16} />
              <span>{formatCoordinates(record.latitude, record.longitude)}</span>
            </a>
          </div>
        </div>

        <div className="success-screen__actions">
          <button className="primary-button" onClick={() => navigate('/worker/history')} type="button">
            View History
          </button>
          <button className="secondary-button" onClick={() => navigate('/worker/check-in')} type="button">
            Back To Home
          </button>
        </div>
      </Panel>
    </Shell>
  );
}

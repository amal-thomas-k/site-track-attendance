import { useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

export function AdminSettingsPage() {
  const { settings, saveSettings } = useAppData();
  const { isFirebaseConfigured } = useAuth();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const environmentSummary = useMemo(
    () =>
      isFirebaseConfigured
        ? 'Firebase credentials detected. The hosted app can authenticate against the configured backend.'
        : 'Firebase credentials are not configured. Demo mode remains available, but production hosting needs real env values.',
    [isFirebaseConfigured],
  );

  const handleSave = () => {
    saveSettings(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Shell title="Admin Settings" subtitle="Operational controls and hosted environment readiness">
      <div className="settings-grid">
        <Panel>
          <div className="panel__heading">
            <h3>Attendance Rules</h3>
            <Badge tone={saved ? 'good' : 'neutral'}>{saved ? 'Saved' : 'Draft'}</Badge>
          </div>

          <div className="settings-form">
            <label>
              <span>Late arrival cutoff</span>
              <input
                onChange={(event) => setDraft((current) => ({ ...current, lateCutoffTime: event.target.value }))}
                type="time"
                value={draft.lateCutoffTime}
              />
            </label>

            <label>
              <span>Default site filter</span>
              <input
                onChange={(event) => setDraft((current) => ({ ...current, defaultSite: event.target.value }))}
                placeholder="All Sites"
                value={draft.defaultSite}
              />
            </label>

            <label>
              <span>Weather summary label</span>
              <input
                onChange={(event) => setDraft((current) => ({ ...current, weatherSummary: event.target.value }))}
                placeholder="Partly Cloudy · 24°C"
                value={draft.weatherSummary}
              />
            </label>

            <label className="toggle-field">
              <span>Live feed enabled</span>
              <input
                checked={draft.liveFeedEnabled}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, liveFeedEnabled: event.target.checked }))
                }
                type="checkbox"
              />
            </label>

            <button className="primary-button" onClick={handleSave} type="button">
              Save Settings
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="panel__heading">
            <h3>Hosting Readiness</h3>
            <Badge tone={isFirebaseConfigured ? 'good' : 'warn'}>
              {isFirebaseConfigured ? 'Ready' : 'Needs Env'}
            </Badge>
          </div>

          <div className="metric-list">
            <div>
              <span>Environment status</span>
              <strong>{environmentSummary}</strong>
            </div>
            <div>
              <span>Docker mode</span>
              <strong>Builds from `web/` and serves static assets via Nginx</strong>
            </div>
            <div>
              <span>Backend mode</span>
              <strong>Real Firebase or optional emulator profile</strong>
            </div>
          </div>
        </Panel>
      </div>
    </Shell>
  );
}

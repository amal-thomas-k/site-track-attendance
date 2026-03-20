import { Plus, Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Panel } from '../../components/Panel';
import { Shell } from '../../components/Shell';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { getStatusTone, humanizeAvailability } from '../../lib/utils';

export function AdminWorkersPage() {
  const { workers, addDemoWorker } = useAppData();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    assignedSite: '',
    trade: '',
    zone: '',
    shift: '',
    email: '',
    availabilityStatus: 'active' as const,
  });

  const filteredWorkers = useMemo(
    () =>
      workers.filter((worker) =>
        `${worker.name} ${worker.assignedSite} ${worker.trade ?? ''} ${worker.zone ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, workers],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addDemoWorker(formData);
    setFormData({
      name: '',
      assignedSite: '',
      trade: '',
      zone: '',
      shift: '',
      email: '',
      availabilityStatus: 'active',
    });
    setShowForm(false);
  };

  return (
    <Shell title="Worker Directory" subtitle="Search, review, and manage the active workforce roster">
      <Panel>
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, role, or site"
              value={query}
            />
          </label>

          {user?.mode === 'demo' ? (
            <button className="primary-button primary-button--compact" onClick={() => setShowForm((current) => !current)} type="button">
              <Plus size={16} />
              <span>{showForm ? 'Close Form' : 'Add Demo Worker'}</span>
            </button>
          ) : null}
        </div>

        {showForm ? (
          <form className="worker-form" onSubmit={handleSubmit}>
            <input
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              placeholder="Worker name"
              required
              value={formData.name}
            />
            <input
              onChange={(event) => setFormData((current) => ({ ...current, assignedSite: event.target.value }))}
              placeholder="Assigned site"
              required
              value={formData.assignedSite}
            />
            <input
              onChange={(event) => setFormData((current) => ({ ...current, trade: event.target.value }))}
              placeholder="Trade"
              value={formData.trade}
            />
            <input
              onChange={(event) => setFormData((current) => ({ ...current, zone: event.target.value }))}
              placeholder="Zone"
              value={formData.zone}
            />
            <input
              onChange={(event) => setFormData((current) => ({ ...current, shift: event.target.value }))}
              placeholder="Shift"
              value={formData.shift}
            />
            <input
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              type="email"
              value={formData.email}
            />
            <select
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  availabilityStatus: event.target.value as typeof formData.availabilityStatus,
                }))
              }
              value={formData.availabilityStatus}
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="off_shift">Off Shift</option>
            </select>
            <button className="secondary-button" type="submit">
              Save Demo Worker
            </button>
          </form>
        ) : null}
      </Panel>

      <div className="directory-grid">
        {filteredWorkers.length === 0 ? (
          <EmptyState
            title="No workers matched"
            description="Try adjusting the search query or add a demo worker."
          />
        ) : (
          filteredWorkers.map((worker) => (
            <Panel key={worker.id}>
              <div className="worker-card">
                <div className="worker-card__header">
                  <div className="worker-card__avatar">{worker.name.slice(0, 2).toUpperCase()}</div>
                  <div className="worker-card__identity">
                    <h3>{worker.name}</h3>
                    <p>{worker.trade ?? 'General Crew'}</p>
                  </div>
                  <Badge tone={getStatusTone(worker.availabilityStatus)}>
                    {humanizeAvailability(worker.availabilityStatus)}
                  </Badge>
                </div>
                <div className="metric-list">
                  <div>
                    <span>Site</span>
                    <strong>{worker.assignedSite}</strong>
                  </div>
                  <div>
                    <span>Zone</span>
                    <strong>{worker.zone ?? 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span>Shift</span>
                    <strong>{worker.shift ?? 'Standard Shift'}</strong>
                  </div>
                </div>
              </div>
            </Panel>
          ))
        )}
      </div>
    </Shell>
  );
}

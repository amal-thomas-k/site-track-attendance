import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: 'orange' | 'blue' | 'red';
  helper?: ReactNode;
}

export function StatCard({ label, value, accent = 'orange', helper }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <p className="stat-card__label">{label}</p>
      <div className="stat-card__value-row">
        <strong className="stat-card__value">{value}</strong>
        {helper ? <div className="stat-card__helper">{helper}</div> : null}
      </div>
    </div>
  );
}

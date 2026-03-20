import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'good' | 'warn' | 'bad' | 'neutral';
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

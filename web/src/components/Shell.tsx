import { Bell, ChartColumn, ClipboardList, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';

import { useAuth } from '../context/AuthContext';
import { SessionUser } from '../types';

interface ShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function navForRole(user: SessionUser) {
  if (user.role === 'worker') {
    return [
      { to: '/worker/check-in', label: 'Home', icon: LayoutDashboard },
      { to: '/worker/history', label: 'History', icon: ClipboardList },
    ];
  }

  return [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/workers', label: 'Workers', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: ChartColumn },
    { to: '/admin/reports', label: 'Reports', icon: ClipboardList },
    { to: '/admin/notifications', label: 'Alerts', icon: Bell },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];
}

export function Shell({ title, subtitle, children }: ShellProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const navItems = navForRole(user);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">↯</span>
          <div>
            <p className="brand__eyebrow">Industrial Attendance</p>
            <h1>SiteTrack</h1>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `nav__item ${isActive ? 'nav__item--active' : ''}`}
              to={to}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="ghost-button sidebar__logout" onClick={() => logout()} type="button">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </aside>

      <div className="shell__main">
        <header className="topbar">
          <div>
            <p className="topbar__kicker">
              {user.role === 'admin' ? 'Admin Access' : 'Worker Console'}
              {user.mode === 'demo' ? ' · Demo Mode' : ''}
            </p>
            <h2>{title}</h2>
            {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
          </div>
          <div className="topbar__user">
            <div className="topbar__identity">
              <strong>{user.name}</strong>
              <span>{user.assignedSite}</span>
            </div>
            <div className="topbar__avatar">{user.name.slice(0, 1)}</div>
          </div>
        </header>

        <main className="content">{children}</main>

        <nav className="bottom-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
              to={to}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { AlertTriangle, HardHat, LockKeyhole } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, loading, login, loginDemo, isFirebaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user && !loading) {
    return <Navigate replace to={user.role === 'admin' ? '/admin/dashboard' : '/worker/check-in'} />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand brand--login">
          <span className="brand__mark">↯</span>
          <div>
            <p className="brand__eyebrow">Construction Workforce Management</p>
            <h1>SiteTrack Attendance</h1>
          </div>
        </div>

        <div className="hero-copy">
          <h2>Real-time attendance management for construction sites and field teams.</h2>
          <p>
            Securely record worker check-ins with verified time and GPS location, monitor site activity live,
            and manage workforce attendance from a centralized admin dashboard.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@company.com"
              type="email"
              value={email}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
              value={password}
            />
          </label>

          {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

          {!isFirebaseConfigured ? (
            <div className="inline-alert inline-alert--warn">
              <AlertTriangle size={16} />
              <span>
                Firebase env values are not configured for the hosted web login. Use demo mode below or provide real values from `.env.example`.
              </span>
            </div>
          ) : null}

          <button className="primary-button" disabled={loading || !isFirebaseConfigured} type="submit">
            <LockKeyhole size={18} />
            <span>{loading ? 'Signing In...' : 'Sign In With Firebase'}</span>
          </button>
        </form>

        <div className="auth-switch">
          <span>New worker joining the project?</span>
          <Link className="secondary-button" to="/signup">
            <span>Create Worker Account</span>
          </Link>
        </div>

        <div className="login-demo">
          <button className="secondary-button" onClick={() => loginDemo('worker')} type="button">
            <HardHat size={18} />
            <span>Open Worker Demo</span>
          </button>
          <button className="secondary-button" onClick={() => loginDemo('admin')} type="button">
            <HardHat size={18} />
            <span>Open Admin Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

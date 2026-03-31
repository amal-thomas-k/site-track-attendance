import { useState } from 'react';
import { HardHat, LockKeyhole, UserPlus } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function SignupPage() {
  const { user, loading, signupWorker, loginDemo, isFirebaseConfigured } = useAuth();
  const [form, setForm] = useState({
    name: '',
    assignedSite: '',
    trade: '',
    zone: '',
    shift: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  if (user && !loading) {
    return <Navigate replace to={user.role === 'admin' ? '/admin/dashboard' : '/worker/check-in'} />;
  }

  const handleChange =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await signupWorker({
        name: form.name,
        assignedSite: form.assignedSite,
        email: form.email,
        password: form.password,
        trade: form.trade,
        zone: form.zone,
        shift: form.shift,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create account.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card login-card--wide">
        <div className="brand brand--login">
          <span className="brand__mark">↯</span>
          <div>
            <p className="brand__eyebrow">Worker Self Registration</p>
            <h1>Create Worker Account</h1>
          </div>
        </div>

        <div className="hero-copy">
          <h2>Register each worker once with their own email, then use sign-in for future access.</h2>
          <p>
            New workers can create their account, store their site details, and later review both
            attendance records and account access logs from the same portal.
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input onChange={handleChange('name')} placeholder="Worker full name" required value={form.name} />
          </label>

          <label>
            <span>Assigned Site</span>
            <input
              onChange={handleChange('assignedSite')}
              placeholder="Assigned construction site"
              required
              value={form.assignedSite}
            />
          </label>

          <label>
            <span>Trade</span>
            <input onChange={handleChange('trade')} placeholder="Mason, Electrician, Supervisor" value={form.trade} />
          </label>

          <label>
            <span>Zone</span>
            <input onChange={handleChange('zone')} placeholder="Gate, Block, or Work Zone" value={form.zone} />
          </label>

          <label>
            <span>Shift</span>
            <input onChange={handleChange('shift')} placeholder="08:00 - 16:00" value={form.shift} />
          </label>

          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={handleChange('email')}
              placeholder="worker@company.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete="new-password"
              onChange={handleChange('password')}
              placeholder="Minimum 8 characters"
              required
              type="password"
              value={form.password}
            />
          </label>

          <label>
            <span>Confirm Password</span>
            <input
              autoComplete="new-password"
              onChange={handleChange('confirmPassword')}
              placeholder="Re-enter password"
              required
              type="password"
              value={form.confirmPassword}
            />
          </label>

          {error ? <div className="inline-alert inline-alert--error signup-form__alert">{error}</div> : null}

          <div className="signup-form__actions">
            <button className="primary-button" disabled={loading || !isFirebaseConfigured} type="submit">
              <UserPlus size={18} />
              <span>{loading ? 'Creating Account...' : 'Create Worker Account'}</span>
            </button>

            <Link className="secondary-button" to="/login">
              <LockKeyhole size={18} />
              <span>Back To Sign In</span>
            </Link>
          </div>
        </form>

        <div className="auth-switch">
          <span>Need a quick product walkthrough?</span>
          <button className="secondary-button" onClick={() => loginDemo('worker')} type="button">
            <HardHat size={18} />
            <span>Open Worker Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

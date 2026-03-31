import { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { LoadingView } from './components/LoadingView';
import { useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then((module) => ({ default: module.SignupPage })));
const WorkerHomePage = lazy(() =>
  import('./pages/worker/WorkerHomePage').then((module) => ({ default: module.WorkerHomePage })),
);
const WorkerHistoryPage = lazy(() =>
  import('./pages/worker/WorkerHistoryPage').then((module) => ({ default: module.WorkerHistoryPage })),
);
const WorkerSuccessPage = lazy(() =>
  import('./pages/worker/WorkerSuccessPage').then((module) => ({ default: module.WorkerSuccessPage })),
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })),
);
const AdminWorkersPage = lazy(() =>
  import('./pages/admin/AdminWorkersPage').then((module) => ({ default: module.AdminWorkersPage })),
);
const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminAnalyticsPage').then((module) => ({ default: module.AdminAnalyticsPage })),
);
const AdminReportsPage = lazy(() =>
  import('./pages/admin/AdminReportsPage').then((module) => ({ default: module.AdminReportsPage })),
);
const AdminNotificationsPage = lazy(() =>
  import('./pages/admin/AdminNotificationsPage').then((module) => ({ default: module.AdminNotificationsPage })),
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage })),
);

function RequireRole({ role }: { role: 'worker' | 'admin' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate replace to={user.role === 'admin' ? '/admin/dashboard' : '/worker/check-in'} />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <Navigate replace to={user.role === 'admin' ? '/admin/dashboard' : '/worker/check-in'} />;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingView />}>
      <Routes>
        <Route element={<HomeRedirect />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignupPage />} path="/signup" />

        <Route element={<RequireRole role="worker" />}>
          <Route element={<WorkerHomePage />} path="/worker/check-in" />
          <Route element={<WorkerHistoryPage />} path="/worker/history" />
          <Route element={<WorkerSuccessPage />} path="/worker/success" />
        </Route>

        <Route element={<RequireRole role="admin" />}>
          <Route element={<AdminDashboardPage />} path="/admin/dashboard" />
          <Route element={<AdminWorkersPage />} path="/admin/workers" />
          <Route element={<AdminAnalyticsPage />} path="/admin/analytics" />
          <Route element={<AdminReportsPage />} path="/admin/reports" />
          <Route element={<AdminNotificationsPage />} path="/admin/notifications" />
          <Route element={<AdminSettingsPage />} path="/admin/settings" />
        </Route>

        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Suspense>
  );
}

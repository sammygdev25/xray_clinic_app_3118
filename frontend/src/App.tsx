import './App.css';
import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { Footer } from './components/ui';
import { STAFF_ROLES, homeFor } from './lib/roles';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import ExamDetailPage from './pages/ExamDetailPage';
import InvoicesPage from './pages/InvoicesPage';
import StaffRoomsPage from './pages/StaffRoomsPage';
import StaffExamsPage from './pages/StaffExamsPage';
import StaffInvoicesPage from './pages/StaffInvoicesPage';
import StaffReportsPage from './pages/StaffReportsPage';
import OrderPayPage from './pages/OrderPayPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ProfilePage from './pages/ProfilePage';
import UnpaidNotice from './components/UnpaidNotice';

interface RequireAuthProps { children: ReactNode }

function RequireAuth({ children }: RequireAuthProps) {
  const auth = useAuth() as { isAuthenticated?: boolean; loading?: boolean };
  if (auth && auth.loading) {
    return null;
  }
  const authed = auth && typeof auth.isAuthenticated === 'boolean' ? auth.isAuthenticated : Boolean(localStorage.getItem('token'));
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

interface RequireRoleProps { roles: readonly string[]; children: ReactNode }

function RequireRole({ roles, children }: RequireRoleProps) {
  const auth = useAuth() as { isAuthenticated?: boolean; loading?: boolean; user?: { role?: string } | null };
  if (auth && auth.loading) {
    return null;
  }
  if (auth == null || auth.isAuthenticated !== true) {
    return <Navigate to="/login" replace />;
  }
  const role = (auth.user && auth.user?.role) || '';
  if (roles.indexOf(role) < 0) {
    return <Navigate to={homeFor(role)} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="ds-page">
          <Navbar />
          <main className="ds-page-main">
            <UnpaidNotice />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<RequireAuth><PatientDashboardPage /></RequireAuth>} />
              <Route path="/exams/:id" element={<RequireAuth><ExamDetailPage /></RequireAuth>} />
              <Route path="/invoices" element={<RequireAuth><InvoicesPage /></RequireAuth>} />
              <Route path="/staff/rooms" element={<RequireRole roles={STAFF_ROLES}><StaffRoomsPage /></RequireRole>} />
              <Route path="/staff/exams" element={<RequireRole roles={STAFF_ROLES}><StaffExamsPage /></RequireRole>} />
              <Route path="/staff/invoices" element={<RequireRole roles={STAFF_ROLES}><StaffInvoicesPage /></RequireRole>} />
              <Route path="/staff/reports" element={<RequireRole roles={STAFF_ROLES}><StaffReportsPage /></RequireRole>} />
              <Route path="/order-pay" element={<RequireAuth><OrderPayPage /></RequireAuth>} />
              <Route path="/payment-cancel" element={<PaymentCancelPage />} />
              <Route path="/payment-success" element={<RequireAuth><PaymentSuccessPage /></RequireAuth>} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer brand="Xray Clinic App 3118" columns={[{ title: 'Explore', links: [{ label: 'Home', to: '/' }, { label: 'Profile', to: '/profile' }] }]} />
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;

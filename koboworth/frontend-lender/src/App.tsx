import { Routes, Route, Navigate } from 'react-router-dom';

// Lender App
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { Login } from './features/auth/Login';

import { Layout } from './components/Layout';
import { UsageDashboard } from './features/dashboard/UsageDashboard';
import { PassportLookup } from './features/passport/PassportLookup';
import { Settings } from './features/settings/Settings';
import { PublicVerification } from './features/passport/PublicVerification';

// Admin App
import { AdminAuthProvider, useAdminAuth } from './features/admin/AdminAuthContext';
import { AdminLogin } from './features/admin/AdminLogin';
import { AdminLayout } from './features/admin/AdminLayout';
import { CollectorManagement } from './features/admin/CollectorManagement';
import { DisputeQueue } from './features/admin/DisputeQueue';
import { AuditLogs } from './features/admin/AuditLogs';
import { LenderManagement } from './features/admin/LenderManagement';
import { SystemHealth } from './features/admin/SystemHealth';
import { Complaints } from './features/admin/Complaints';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAdminAuth();
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/p/:code" element={<PublicVerification />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Lender Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<UsageDashboard />} />
        <Route path="lookup" element={<PassportLookup />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<Navigate to="/admin/health" replace />} />
        <Route path="health" element={<SystemHealth />} />
        <Route path="collectors" element={<CollectorManagement />} />
        <Route path="disputes" element={<DisputeQueue />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="logs" element={<AuditLogs />} />
        <Route path="lenders" element={<LenderManagement />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
import { Routes, Route, Navigate } from 'react-router-dom';

// Worker App
import { Register } from './features/auth/Register';
import { UserLogin } from './features/auth/UserLogin';
import { UserDashboard } from './features/dashboard/UserDashboard';
import { PublicVerification } from './features/passport/PublicVerification';
import { AdminDashboard } from './features/admin/AdminDashboard';


function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/p/:code" element={<PublicVerification />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user-login" element={<UserLogin />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <AppRoutes />
  );
}

export default App;
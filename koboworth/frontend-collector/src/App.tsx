import { Routes, Route, Navigate } from 'react-router-dom';

// Collector App
import { Register } from './features/auth/Register';
import { CollectorLogin } from './features/auth/CollectorLogin';
import { CollectorDashboard } from './features/dashboard/CollectorDashboard';



function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/collector-login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/collector-login" element={<CollectorLogin />} />
      <Route path="/collector-dashboard" element={<CollectorDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <AppRoutes />
  );
}

export default App;
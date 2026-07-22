import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { LayoutDashboard, Search, Settings, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = (path: string, label: string, Icon: any) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-center">
          <img src="/logo.png" alt="Koboworth Logo" className="dark:invert w-full h-auto object-contain px-4" />
        </div>
        <nav className="flex-1 p-4">
          {navItem('/dashboard', 'Usage Dashboard', LayoutDashboard)}
          {navItem('/lookup', 'Passport Lookup', Search)}
          {navItem('/settings', 'API Settings', Settings)}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-left">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
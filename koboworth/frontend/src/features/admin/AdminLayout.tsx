import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { Users, AlertTriangle, ScrollText, Network, ActivitySquare, LogOut } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItem = (path: string, label: string, Icon: any) => {
    const isActive = location.pathname.includes(path);
    return (
      <Link to={path} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${isActive ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <Icon className="w-5 h-5" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center">
          <img src="/logo.png" alt="Koboworth Logo" className="dark:invert w-full h-auto object-contain mb-4 filter brightness-110 px-2" />
          <span className="text-xs font-black text-red-500 uppercase tracking-widest">Ops Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItem('/admin/collectors', 'Collectors', Users)}
          {navItem('/admin/disputes', 'Disputes', AlertTriangle)}
          {navItem('/admin/logs', 'Audit & Consent', ScrollText)}
          {navItem('/admin/lenders', 'Lender Setup', Network)}
          {navItem('/admin/health', 'System Health', ActivitySquare)}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition font-medium">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
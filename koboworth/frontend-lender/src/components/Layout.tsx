import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { LayoutDashboard, Search, Settings, LogOut, Sun, Moon, Menu, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = (path: string, label: string, Icon: any) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <img src="/logo.png" alt="Koboworth Logo" className="dark:invert h-20 w-auto object-contain -ml-2" />
        <div className="flex gap-4">
          <button onClick={toggleDarkMode} className="text-gray-500 dark:text-slate-400">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-slate-400">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <aside className={`w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col ${isSidebarOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="hidden md:flex p-2 border-b border-gray-100 dark:border-slate-800 justify-center relative">
          <img src="/logo.png" alt="Koboworth Logo" className="dark:invert w-[120%] max-w-none h-auto object-contain -my-4" />
        </div>
        
        <div className="hidden md:flex justify-end p-4 border-b border-gray-100 dark:border-slate-800">
          <button onClick={toggleDarkMode} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            {isDarkMode ? <><Sun size={20} /> Light Mode</> : <><Moon size={20} /> Dark Mode</>}
          </button>
        </div>

        <nav className="flex-1 p-4">
          {navItem('/dashboard', 'Usage Dashboard', LayoutDashboard)}
          {navItem('/lookup', 'Passport Lookup', Search)}
          {navItem('/settings', 'API Settings', Settings)}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition font-medium text-left">
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

import React from 'react';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  title: string;
  onLogout: () => void;
  links: { path: string; label: string }[];
}

export const Navbar: React.FC<NavbarProps> = ({ title, onLogout, links }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-6">
      <h1 className="text-xl font-bold text-blue-600">{title}</h1>
      <nav className="flex gap-4">
        {links.map(link => (
          <Link key={link.path} to={link.path} className="text-gray-600 hover:text-blue-600 font-medium">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
    <button onClick={onLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition">
      <LogOut className="w-4 h-4" /> Logout
    </button>
  </header>
);
import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // F87 Mock admin credential
      login('mock_admin_token');
      navigate('/admin/health');
    } else {
      alert('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Koboworth Logo" className="w-[220px] h-auto object-contain mb-4 filter brightness-0 invert drop-shadow-[0_0_1px_rgba(255,255,255,1)]" />
          <h2 className="text-2xl font-bold text-center text-white drop-shadow-sm">IT Specialist Portal</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 placeholder-slate-400"
              placeholder="Admin Password (admin123)"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold transition">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};
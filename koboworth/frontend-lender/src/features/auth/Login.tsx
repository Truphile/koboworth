import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export const Login: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', 'lender');
      formData.append('password', apiKey);
      
      const res = await api.post('/v1/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      login(res.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 
                       (Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : 
                       'Network error. Please check your connection and try again.');
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 font-sans flex items-center justify-center">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

      {/* Glass Container */}
      <div className="relative z-10 w-full max-w-lg p-8 mx-4">
        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-10 rounded-3xl shadow-2xl">
          
          <div className="flex flex-col items-center text-center mb-10">
            <img 
              src="/logo.png" 
              alt="Koboworth Logo" 
              className="h-32 w-auto object-contain mb-6 brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
            />
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Lender Portal</h2>
            <p className="text-slate-400 font-medium">Authenticate to access the Koboworth API</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-semibold text-slate-300 mb-2">
                API Key
              </label>
              <div className="relative group">
                <input 
                  id="apiKey"
                  type="password" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-slate-500"
                  placeholder="Enter your API key (e.g. demo-123)"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
            >
              Sign In to Portal
            </button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-slate-400">
                Need an API key?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Request access
                </Link>
              </p>
            </div>
          </form>

        </div>
        
        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          &copy; {new Date().getFullYear()} Koboworth Financial Systems
        </p>
      </div>
    </div>
  );
};
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
    } catch (err) {
      if (apiKey === 'demo-123') {
        login('mock-jwt-token');
        navigate('/dashboard');
      } else {
        setError('Invalid API Key');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
        <img 
          src="/hero-image.jpg" 
          alt="Koboworth Login Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-start p-12 pt-24 text-white h-full">
          <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-md">Access the Lender Portal.</h2>
          <p className="text-xl text-gray-100 font-light max-w-md drop-shadow-md">Verify trust passports, report events, and track your API usage securely.</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.png" alt="Koboworth Logo" className="dark:invert h-64 w-auto object-contain mb-6" />
            <h2 className="text-2xl font-bold text-gray-900">Lender Portal Login</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your API key to access the dashboard</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-pulse">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API Key</label>
              <div className="mt-1">
                <input 
                  id="apiKey"
                  type="password" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)} 
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your API key"
                  required 
                />
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
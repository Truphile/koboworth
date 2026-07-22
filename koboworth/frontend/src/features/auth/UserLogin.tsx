import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import api from '../../api/axios';

export const UserLogin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetNin, setResetNin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !credential) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let res = await api.post(`/workers/login`, { phone_number: phoneNumber, password: credential });
      
      // Store user data in localStorage so dashboard can use it
      localStorage.setItem('koboworth_user', JSON.stringify(res.data));
      navigate('/user-dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 
                       (Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : 
                       'Account not found. Please check your credentials.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    if (!phoneNumber || !resetNin || !newPassword) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/workers/reset-password', {
        phone_number: phoneNumber,
        nin: resetNin,
        new_password: newPassword
      });
      setResetSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess('');
        setCredential('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
        <img 
          src="/hero-image.jpg" 
          alt="Koboworth User Login" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-start p-12 pt-24 text-white h-full">
          <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-md">Your Trust Passport awaits.</h2>
          <p className="text-xl text-gray-100 font-light max-w-md drop-shadow-md">Access your credit profile, view your score, and manage your financial reputation.</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.png" alt="Koboworth Logo" className="dark:invert h-64 w-auto object-contain mb-6" />
            <h2 className="text-2xl font-bold text-gray-900">{showForgotPassword ? 'Reset Password' : 'Welcome Back'}</h2>
            <p className="mt-2 text-sm text-gray-600">{showForgotPassword ? 'Verify your NIN to set a new password' : 'Access your Trust Passport and dashboard'}</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-pulse">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {resetSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
              <p className="text-sm font-medium">{resetSuccess}</p>
            </div>
          )}

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 08012345678"
                    required 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button type="button" onClick={() => { setShowForgotPassword(true); setError(''); }} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                    Forgot Password?
                  </button>
                </div>
                <div className="mt-1">
                  <input 
                    type="password" 
                    value={credential} 
                    onChange={e => setCredential(e.target.value)} 
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required 
                  />
                </div>
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">Don't have an account? </span>
                <Link to="/register" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  Register here
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 08012345678"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">NIN (National ID)</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={resetNin} 
                    onChange={e => setResetNin(e.target.value)} 
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Verify your NIN"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1">
                  <input 
                    type="password" 
                    minLength={8}
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Create a strong password (min. 8 chars)"
                    required 
                  />
                </div>
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <button type="button" onClick={() => { setShowForgotPassword(false); setError(''); }} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

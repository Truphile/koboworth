import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    phone_number: '',
    first_name: '',
    last_name: '',
    bvn: '',
    nin: '',
    name: '', // for collector
    region: '', // for collector
    pin: '', // for collector
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Mock API request since Lender Registration is currently an administrative process
    setTimeout(() => {
      setSuccess('Your request has been submitted! Our team will contact you shortly with your API credentials.');
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 font-sans flex items-center justify-center py-12">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

      {/* Glass Container */}
      <div className="relative z-10 w-full max-w-xl p-8 mx-4">
        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-10 rounded-3xl shadow-2xl">
          
          <div className="flex flex-col items-center text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Koboworth Logo" 
              className="h-28 w-auto object-contain mb-5 brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
            />
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Request API Access</h2>
            <p className="text-slate-400 font-medium">Join the Koboworth lending network</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-pulse">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
                <input 
                  name="first_name"
                  type="text" 
                  value={formData.first_name} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-slate-500"
                  required 
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
                <input 
                  name="last_name"
                  type="text" 
                  value={formData.last_name} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-slate-500"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Company Name</label>
              <input 
                name="name"
                type="text" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-slate-500"
                placeholder="e.g. Acme Microfinance"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Work Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-slate-500"
                placeholder="you@company.com"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-4 px-6 mt-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
            >
              Submit Access Request
            </button>
            
            <div className="text-center mt-6">
              <span className="text-sm text-slate-400">Already have an API Key? </span>
              <Link to="/login" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Sign in here
              </Link>
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

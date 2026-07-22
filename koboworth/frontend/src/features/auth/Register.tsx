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
    password: '',
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

    try {
      await api.post('/workers', {
        phone_number: formData.phone_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        bvn: formData.bvn || undefined,
        nin: formData.nin || undefined,
        password: formData.password,
      });
      
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/user-login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
        <img 
          src="/hero-image.jpg" 
          alt="Koboworth Front Page Display" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-start p-12 pt-24 text-white h-full">
          <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-md">Join the financial revolution.</h2>
          <p className="text-xl text-gray-100 font-light max-w-md drop-shadow-md">Create your profile today and start building a verifiable credit history with Koboworth.</p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6 bg-white p-10 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.png" alt="Koboworth Logo" className="dark:invert h-64 w-auto object-contain mb-6" />
            <h2 className="text-2xl font-bold text-gray-900">Worker Registration</h2>
            <p className="mt-2 text-sm text-gray-600">Join Koboworth to build your credit profile</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-pulse">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}



          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                name="phone_number"
                type="text" 
                value={formData.phone_number} 
                onChange={handleInputChange} 
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 08012345678"
                required 
              />
            </div>


                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input 
                      name="first_name"
                      type="text" 
                      value={formData.first_name} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required 
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input 
                      name="last_name"
                      type="text" 
                      value={formData.last_name} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required 
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">BVN</label>
                    <input 
                      name="bvn"
                      type="text" 
                      maxLength={11}
                      value={formData.bvn} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">NIN</label>
                    <input 
                      name="nin"
                      type="text" 
                      maxLength={11}
                      value={formData.nin} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    minLength={8}
                    value={formData.password} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Create a strong password (min. 8 characters)"
                    required
                  />
                </div>
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Complete Registration
              </button>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <Link to="/user-login" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign in here
              </Link>
            </div>
            
            </form>
        </div>
      </div>
    </div>
  );
};

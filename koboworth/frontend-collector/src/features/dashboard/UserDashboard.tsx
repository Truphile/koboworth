import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Target, TrendingUp, Users, Award, Edit2, Save, X, Menu, QrCode, Barcode, Sun, Moon, MessageSquare, Plus, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTab, setSupportTab] = useState<'new' | 'list'>('new');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [newComplaintSubject, setNewComplaintSubject] = useState('');
  const [newComplaintDesc, setNewComplaintDesc] = useState('');
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bvn: '',
    nin: '',
    passportCode: '',
    ajoGroup: 'Not Assigned',
    collectorName: 'Pending',
    cycleDuration: 'N/A',
    trustScore: 0,
    tier: '',
    savingsConsistency: 0,
  });

  const [mockSavingsData, setMockSavingsData] = useState<{month: string, amount: number}[]>([]);
  const [paymentDates, setPaymentDates] = useState<string[]>([]);
  const [timeFrame, setTimeFrame] = useState('6M');
  const [editForm, setEditForm] = useState({ ...userData });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const stored = localStorage.getItem('koboworth_user');
      if (!stored) {
        navigate('/user-login');
        return;
      }
      
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role !== 'WORKER') {
          navigate('/collector-dashboard');
          return;
        }

        const res = await api.get(`/workers/${parsed.id}/dashboard`);
        const data = res.data;
        
        const newState = {
          firstName: data.profile.firstName || 'User',
          lastName: data.profile.lastName || '',
          phone: data.profile.phone || '',
          bvn: data.profile.bvn || 'Not Provided',
          nin: data.profile.nin || 'Not Provided',
          passportCode: data.profile.passportCode || 'TP-PENDING',
          ajoGroup: data.group?.name || 'Not Assigned',
          collectorName: data.group?.collector_name || 'Pending',
          cycleDuration: data.group?.cycle_duration || 'N/A',
          trustScore: data.trust.score || 0,
          tier: data.trust.tier || 'Unrated',
          savingsConsistency: data.payment_dates?.length > 0 && data.group?.cycle_duration 
            ? Math.min(100, Math.round((data.payment_dates.length / parseInt(data.group.cycle_duration)) * 100)) 
            : 0,
        };
        
        setUserData(newState);
        setEditForm(newState);
        setMockSavingsData(data.savings_chart);
        setPaymentDates(data.payment_dates || []);

        try {
          const compRes = await api.get(`/workers/${parsed.id}/complaints`);
          setComplaints(compRes.data);
        } catch (e) {
          console.error("Failed to load complaints", e);
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleSaveProfile = () => {
    // Ideally this would POST to the backend, but we just update local state for the UI demo.
    setUserData(editForm);
    setIsEditing(false);
  };

  const handleSubmitComplaint = async () => {
    if (!newComplaintSubject || !newComplaintDesc) return;
    try {
      const stored = localStorage.getItem('koboworth_user');
      const parsed = JSON.parse(stored!);
      await api.post(`/workers/${parsed.id}/complaints`, {
        subject: newComplaintSubject,
        description: newComplaintDesc
      });
      setNewComplaintSubject('');
      setNewComplaintDesc('');
      const compRes = await api.get(`/workers/${parsed.id}/complaints`);
      setComplaints(compRes.data);
      setSupportTab('list');
    } catch (e) {
      console.error(e);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'GOLD': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'SILVER': return 'text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 border-gray-300';
      case 'BRONZE': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 border-dashed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col font-sans">
      <header className="bg-white dark:bg-slate-900 shadow-sm py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10">
        <img src="/logo.png" alt="Koboworth Logo" className="dark:invert h-[140px] w-auto object-contain -my-10 relative z-20" />
        <div className="flex items-center gap-8">
          <div className="hidden md:block text-right pr-2">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{userData.firstName} {userData.lastName}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{userData.phone}</p>
          </div>
          <div className="hidden md:flex h-10 w-10 bg-blue-600 text-white rounded-full items-center justify-center font-bold">
            {userData.firstName[0]}{userData.lastName[0]}
          </div>
          
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm ml-2"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
<button 
            className="hidden md:block text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-5 py-2 font-semibold transition-colors shadow-sm ml-2"
            onClick={() => window.location.href = '/user-login'}
          >
            Sign Out
          </button>
          <button 
            className="md:hidden text-gray-800 dark:text-slate-100 hover:text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-lg absolute w-full z-20">
          <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50">
            <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
              {userData.firstName[0]}{userData.lastName[0]}
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{userData.firstName} {userData.lastName}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{userData.phone}</p>
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${getTierColor(userData.tier)}`}>
              {userData.tier?.toUpperCase() === 'UNRATED' ? 'Unrated' : `${userData.tier} Tier`}
            </span>
          </div>
          <div className="p-4">
            
            <button 
              className="w-full py-3 mb-3 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-[8px] font-bold flex justify-center items-center gap-2 transition-colors shadow-sm"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <><Sun className="w-5 h-5" /> Light Mode</> : <><Moon className="w-5 h-5" /> Dark Mode</>}
            </button>
<button 
              className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-[8px] font-bold hover:bg-red-100 flex justify-center items-center transition-colors shadow-sm"
              onClick={() => window.location.href = '/user-login'}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 md:p-8 space-y-6 md:space-y-8">
        
        {/* USSD Reminder Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Access your Trust Passport offline!</h3>
            <p className="text-blue-700 dark:text-blue-200 mt-1">No internet? No problem. Simply dial <span className="font-mono font-bold bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded text-blue-900 dark:text-blue-100 mx-1">*347#</span> on your mobile phone to check your score and tier instantly via USSD.</p>
          </div>
          <div className="hidden md:flex h-12 w-12 bg-blue-600 text-white rounded-full items-center justify-center font-bold text-xl shadow-lg">
            #
          </div>
        </div>

        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col justify-between transform transition duration-300 hover:scale-105">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Trust Score</p>
                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{userData.trustScore}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl"><Shield className="text-blue-600 w-6 h-6" /></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(userData.trustScore / 850) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 text-right">Out of 850</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col justify-between transform transition duration-300 hover:scale-105">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Current Tier</p>
                <h3 className={`mt-2 tracking-tight ${userData.tier?.toUpperCase() === 'UNRATED' ? 'font-semibold text-gray-500 dark:text-slate-400 text-xl' : 'text-3xl font-extrabold text-gray-900 dark:text-white'}`}>{userData.tier?.toUpperCase() === 'UNRATED' ? 'Unrated' : userData.tier}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl"><Award className="text-yellow-600 w-6 h-6" /></div>
            </div>
            <span className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-sm font-semibold border ${getTierColor(userData.tier)}`}>
              {userData.tier?.toUpperCase() === 'UNRATED' ? 'Evaluating Profile' : 'Top 15% User'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col justify-between transform transition duration-300 hover:scale-105">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Savings Consistency</p>
                <h3 className="text-4xl font-extrabold text-green-600 mt-1">{userData.savingsConsistency}%</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-xl"><TrendingUp className="text-green-600 w-6 h-6" /></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              On track for limit increase
            </p>
          </div>

          <div 
            onClick={() => setShowPassport(true)}
            className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-lg border border-blue-600 p-6 flex flex-col justify-between transform transition duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white dark:bg-slate-900 opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-blue-200 font-medium text-sm">Digital Identity</p>
                <h3 className="text-2xl font-extrabold text-white mt-1 leading-tight">Trust<br/>Passport</h3>
              </div>
              <div className="bg-blue-800/50 backdrop-blur-sm p-3 rounded-xl border border-blue-400/30"><QrCode className="text-white w-6 h-6" /></div>
            </div>
            <div className="relative z-10 flex items-center gap-2 mt-4 text-blue-100 font-semibold group-hover:text-white transition-colors">
              <span>View My Passport</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details Section */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profile Details
              </h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 bg-gray-100 dark:bg-slate-800 p-2 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleSaveProfile} className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">First Name</p>
                {isEditing ? (
                  <input type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                ) : (
                  <p className="font-semibold text-gray-900 dark:text-white">{userData.firstName}</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Last Name</p>
                {isEditing ? (
                  <input type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                ) : (
                  <p className="font-semibold text-gray-900 dark:text-white">{userData.lastName}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Phone Number</p>
                {isEditing ? (
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                ) : (
                  <p className="font-semibold text-gray-900 dark:text-white">{userData.phone}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Ajo Group</p>
                <p className="font-semibold text-gray-900 dark:text-white">{userData.ajoGroup}</p>
                <p className="text-xs text-gray-400 mt-1">Managed by your Collector</p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">BVN (Masked)</p>
                <p className="font-semibold text-gray-900 dark:text-white">XXXXXXX{userData.bvn.length > 4 ? userData.bvn.slice(-4) : userData.bvn}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">NIN (Masked)</p>
                <p className="font-semibold text-gray-900 dark:text-white">XXXXXXX{userData.nin.length > 4 ? userData.nin.slice(-4) : userData.nin}</p>
              </div>
            </div>
          </div>

          {/* Activity and Ajo Group Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Ajo Group Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-md p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                <Users className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h2 className="text-blue-200 font-medium mb-1">Registered Ajo Group</h2>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">{userData.ajoGroup}</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-md rounded-lg p-3 border border-white/20 sm:w-1/2 flex items-center justify-between sm:block">
                    <p className="text-xs text-blue-200 mb-0 sm:mb-1">Collector</p>
                    <p className="text-sm font-semibold truncate text-white">{userData.collectorName}</p>
                  </div>
                  <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-md rounded-lg p-3 border border-white/20 sm:w-1/2 flex items-center justify-between sm:block">
                    <p className="text-xs text-blue-200 mb-0 sm:mb-1">Cycle Duration</p>
                    <p className="text-sm font-semibold text-white">{userData.cycleDuration} Days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart and Calendar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Savings Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Savings History</h2>
                  <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-slate-950 p-1 rounded-lg border border-gray-100 dark:border-slate-800">
                    {['1D', '1W', '1M', '3M', '6M', '9M', '1Y'].map(tf => (
                      <button 
                        key={tf}
                        onClick={() => setTimeFrame(tf)}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors ${timeFrame === tf ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-gray-200 dark:border-slate-700' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white'}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    mockSavingsData.slice(
                      timeFrame === '1M' || timeFrame === '1W' || timeFrame === '1D' ? -1 :
                      timeFrame === '3M' ? -3 :
                      timeFrame === '6M' ? -6 :
                      timeFrame === '9M' ? -9 :
                      timeFrame === '1Y' ? -12 : 0
                    )
                  } margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `₦${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Amount']}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#2563eb' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Calendar View */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contribution Calendar ({new Date().toLocaleString('default', { month: 'short', year: 'numeric' })})</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Track your daily savings consistency for this month.</p>
                
                <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs text-gray-600 dark:text-slate-300">Paid</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-50 border border-red-200"></div><span className="text-xs text-gray-600 dark:text-slate-300">Missed</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800"></div><span className="text-xs text-gray-600 dark:text-slate-300">Upcoming</span></div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
                ))}
                {(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = today.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  
                  const cells = [];
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<div key={`empty-${i}`} className="p-2"></div>);
                  }
                  
                  for (let i = 1; i <= daysInMonth; i++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const isPaid = paymentDates.includes(dateStr);
                    
                    const cellDate = new Date(year, month, i);
                    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    
                    const isPast = cellDate < todayDate;
                    const isToday = cellDate.getTime() === todayDate.getTime();
                    
                    let bgClass = "bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-slate-800 text-gray-400"; // Upcoming
                    if (isPaid) {
                      bgClass = "bg-green-500 border-green-600 text-white shadow-sm";
                    } else if (isPast || isToday) {
                      bgClass = "bg-red-50 border-red-200 text-red-500";
                    }
                    
                    if (isToday && !isPaid) {
                      bgClass += " ring-2 ring-blue-400 ring-offset-2";
                    }

                    cells.push(
                      <div key={i} className={`aspect-square flex items-center justify-center rounded-xl border font-bold text-sm transition-all ${bgClass}`}>
                        {i}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>
            
            </div>

          </div>
        </div>
      </main>
      
      {/* Trust Passport Modal Overlay */}
      {showPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPassport(false)}></div>
          
          <div className="relative w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setShowPassport(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-200 bg-gray-900/40 hover:bg-gray-900/60 rounded-full p-2 backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* The Physical Passport Card Design */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden relative group">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-[1.4rem] min-h-[500px] w-full flex flex-col justify-between p-6 relative z-10">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
                    <span className="text-white font-black tracking-widest text-sm opacity-90">KOBOWORTH</span>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 w-10 h-12 rounded-md shadow-inner flex items-center justify-center border border-yellow-200/50">
                    <div className="w-8 h-10 border border-yellow-800/30 rounded flex flex-col justify-evenly px-1">
                      <div className="w-full h-[1px] bg-yellow-800/30"></div>
                      <div className="w-full h-[1px] bg-yellow-800/30"></div>
                      <div className="w-full h-[1px] bg-yellow-800/30"></div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="mt-6 mb-2 flex justify-between items-end">
                  <div>
                    <p className="text-blue-200 text-xs tracking-[0.2em] font-bold uppercase">Digital Identity</p>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Trust Passport</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200/60 text-[10px] uppercase tracking-widest mb-1">Passport No.</p>
                    <p className="text-blue-100 font-mono font-bold tracking-wider">{userData.passportCode}</p>
                  </div>
                </div>

                {/* Profile Data */}
                <div className="flex-1 mt-6 flex flex-col justify-center">
                  <div className="flex gap-4 items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white">
                      {userData.firstName[0]}{userData.lastName[0]}
                    </div>
                    <div>
                      <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Cardholder</p>
                      <p className="text-2xl font-bold text-white leading-none">{userData.firstName} {userData.lastName}</p>
                      <p className="text-blue-300 text-sm mt-1">{userData.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                      <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Trust Score</p>
                      <p className="text-2xl font-black text-white">{userData.trustScore} <span className="text-sm font-normal text-blue-300">/ 850</span></p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                      <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Tier</p>
                      <p className={`text-xl font-black ${userData.tier?.toUpperCase() === 'UNRATED' ? 'text-gray-400' : 'text-white'} truncate`}>{userData.tier?.toUpperCase() === 'UNRATED' ? 'Unrated' : userData.tier}</p>
                    </div>
                  </div>
                </div>

                {/* Footer / QR */}
                <div className="mt-8 flex justify-between items-end border-t border-white/10 pt-5">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-blue-200 text-[10px] uppercase tracking-widest mb-1">Issue Date</p>
                      <p className="text-white text-sm font-mono">{new Date().toLocaleDateString()}</p>
                    </div>
                    <Barcode className="w-24 h-8 text-white opacity-60" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-inner">
                    <QRCodeSVG value={`${window.location.origin}/p/${userData.passportCode}`} size={56} />
                  </div>
                </div>

              </div>
            </div>
            
            <p className="text-center text-gray-400 text-sm mt-4 font-medium flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> Valid securely across all Koboworth partners
            </p>
          </div>
        </div>
      )}

      {/* Support Floating Button */}
      <button 
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 z-40 flex items-center gap-2 font-bold"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="hidden md:inline pr-2">Support Tickets</span>
      </button>

      {/* Support Modal Overlay */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowSupportModal(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-600" /> Support Tickets
              </h2>
              <button onClick={() => setShowSupportModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50 px-6">
              <button onClick={() => setSupportTab('new')} className={`py-4 px-4 font-bold border-b-2 transition-colors ${supportTab === 'new' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>New Ticket</button>
              <button onClick={() => setSupportTab('list')} className={`py-4 px-4 font-bold border-b-2 transition-colors ${supportTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>My Tickets</button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {supportTab === 'new' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                    <input type="text" value={newComplaintSubject} onChange={e => setNewComplaintSubject(e.target.value)} placeholder="E.g., Missing contribution" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea value={newComplaintDesc} onChange={e => setNewComplaintDesc(e.target.value)} placeholder="Please explain the issue..." rows={4} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"></textarea>
                  </div>
                  <button onClick={handleSubmitComplaint} disabled={!newComplaintSubject || !newComplaintDesc} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Submit Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No support tickets found.</p>
                    </div>
                  ) : (
                    complaints.map(c => (
                      <div key={c.id} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">{c.subject}</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.status === 'OPEN' ? 'bg-orange-100 text-orange-700 border border-orange-200' : c.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-700'}`}>{c.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">{c.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

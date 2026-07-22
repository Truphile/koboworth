import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, ClipboardList, Target, TrendingUp, Clock, AlertCircle, FileText, CheckCircle, Search, Menu, X, Sun, Moon, PlusCircle, Calendar } from 'lucide-react';
import api from '../../api/axios';

export const CollectorDashboard: React.FC = () => {
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

  const [userData, setUserData] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for data
  const [groups, setGroups] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<'NONE' | 'CREATE_GROUP' | 'ADD_WORKER' | 'RECORD_SAVINGS' | 'VIEW_HISTORY'>('NONE');

  // Form states
  const [groupName, setGroupName] = useState('');
  const [cycleDuration, setCycleDuration] = useState('30');
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [amount, setAmount] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchGroupsAndHistory = async (collectorId: string) => {
    try {
      const res = await api.get(`/collectors/${collectorId}/groups`);
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroup) {
        setSelectedGroup(res.data[0].id);
      }
      const histRes = await api.get(`/collectors/${collectorId}/history`);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const data = localStorage.getItem('koboworth_user');
    if (!data) {
      navigate('/user-login');
      return;
    }
    const parsed = JSON.parse(data);
    if (parsed.role !== 'COLLECTOR') {
      navigate('/user-dashboard');
      return;
    }
    setUserData(parsed);
    fetchGroupsAndHistory(parsed.id);
  }, [navigate]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/collectors/${userData.id}/groups`, {
        name: groupName,
        cycle_duration_days: cycleDuration
      });
      showMessage('Group created successfully!', 'success');
      setActiveModal('NONE');
      setGroupName('');
      fetchGroupsAndHistory(userData.id);
    } catch (err: any) {
      showMessage(err.response?.data?.detail || 'Error creating group', 'error');
    }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return showMessage('Please create a group first', 'error');
    try {
      const res = await api.post(`/collectors/groups/${selectedGroup}/members`, {
        phone_number: workerPhone
      });
      showMessage(`Worker ${res.data.worker_name} added to group successfully!`, 'success');
      setActiveModal('NONE');
      setWorkerPhone('');
      fetchGroupsAndHistory(userData.id);
    } catch (err: any) {
      showMessage(err.response?.data?.detail || 'Error adding worker. Ensure they are registered.', 'error');
    }
  };

  const handleRecordSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return showMessage('Please create a group first', 'error');
    try {
      const res = await api.post(`/collectors/groups/${selectedGroup}/contributions`, {
        phone_number: workerPhone,
        amount: parseFloat(amount)
      });
      showMessage(`Successfully recorded ₦${res.data.amount} (Ref: ${res.data.reference})`, 'success');
      setActiveModal('NONE');
      setWorkerPhone('');
      setAmount('');
    } catch (err: any) {
      showMessage(err.response?.data?.detail || 'Error recording savings', 'error');
    }
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col font-sans">
      <header className="bg-white dark:bg-slate-900 shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-10">
        <img src="/logo.png" alt="Koboworth Logo" className="dark:invert h-[156px] w-auto object-contain -my-8 relative z-20" />
        <div className="flex items-center gap-8">
          <button onClick={toggleDarkMode} className="text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <div className="hidden md:block text-right pr-2">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{userData.name}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Ajo Collector • {userData.region}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('koboworth_user');
              navigate('/user-login');
            }}
            className="hidden md:block text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-5 py-2 font-semibold transition-colors shadow-sm"
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
            <div className="h-16 w-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{userData.name}</p>
            <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold border text-purple-700 bg-purple-50 border-purple-200">
              AJO COLLECTOR • {userData.region?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <button 
            className="w-full py-4 text-red-600 font-bold hover:bg-red-50 flex justify-center items-center"
            onClick={() => {
              localStorage.removeItem('koboworth_user');
              navigate('/user-login');
            }}
          >
            Sign Out
          </button>
        </div>
      )}

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 relative">
        
        {message.text && (
          <div className={`p-4 rounded-xl shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Collector Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-2">Manage your Ajo groups, register workers, and record daily contributions.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => setActiveModal('ADD_WORKER')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <PlusCircle className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Worker to Group</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Register an existing worker</p>
          </div>
          
          <div onClick={() => setActiveModal('RECORD_SAVINGS')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Record Savings</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Log a daily contribution</p>
          </div>

          <div onClick={() => setActiveModal('CREATE_GROUP')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <Users className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Create New Group</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Start a new Ajo cycle</p>
          </div>

          <div onClick={() => setActiveModal('VIEW_HISTORY')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow">
            <Calendar className="w-10 h-10 text-orange-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Collection History</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">View actual past records</p>
          </div>
        </div>

        {/* Groups Overview */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Ajo Groups</h2>
          {groups.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-slate-950 rounded-xl">
              <p className="text-gray-500 dark:text-slate-400">You don't have any groups yet. Click "Create New Group" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {groups.map(g => (
                <div key={g.id} className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{g.name}</p>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Members:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{g.member_count}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Cycle Duration:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{g.cycle_duration} days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Modals */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-950">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {activeModal === 'CREATE_GROUP' && 'Create New Group'}
                {activeModal === 'ADD_WORKER' && 'Add Worker to Group'}
                {activeModal === 'RECORD_SAVINGS' && 'Record Savings'}
                {activeModal === 'VIEW_HISTORY' && 'Transaction History'}
              </h3>
              <button onClick={() => setActiveModal('NONE')} className="text-gray-400 hover:text-gray-600 dark:text-slate-300"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {activeModal === 'CREATE_GROUP' && (
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Group Name</label>
                    <input type="text" required value={groupName} onChange={e => setGroupName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Market Women Ajo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cycle Duration (Days)</label>
                    <input type="number" required value={cycleDuration} onChange={e => setCycleDuration(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700">Create Group</button>
                </form>
              )}

              {activeModal === 'ADD_WORKER' && (
                <form onSubmit={handleAddWorker} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Group</label>
                    <select required value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5">
                      <option value="">-- Select Group --</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Worker Phone Number</label>
                    <input type="text" required value={workerPhone} onChange={e => setWorkerPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="Must be already registered" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700">Add to Group</button>
                </form>
              )}

              {activeModal === 'RECORD_SAVINGS' && (
                <form onSubmit={handleRecordSavings} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Group</label>
                    <select required value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5">
                      <option value="">-- Select Group --</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Worker Phone Number</label>
                    <input type="text" required value={workerPhone} onChange={e => setWorkerPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (₦)</label>
                    <input type="number" required min="100" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 5000" />
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700">Record Contribution</button>
                </form>
              )}

              {activeModal === 'VIEW_HISTORY' && (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-slate-400 py-4">No transactions found.</p>
                  ) : (
                    history.map(tx => (
                      <div key={tx.id} className="p-4 border border-gray-100 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-950 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{tx.worker_name}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{tx.group_name}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(tx.date).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-green-600 text-lg">+₦{tx.amount}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1">{tx.reference}</p>
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

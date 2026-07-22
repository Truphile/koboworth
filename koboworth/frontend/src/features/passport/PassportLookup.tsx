import React, { useState } from 'react';
import api from '../../api/axios';
import { Search, ShieldCheck, AlertCircle } from 'lucide-react';

export const PassportLookup: React.FC = () => {
  const [code, setCode] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setData(null);
    try {
      const res = await api.get(`/v1/passports/${code}`);
      setData(res.data);
    } catch (err) {
      setError('Passport not found or access denied');
    }
  };

  const reportEvent = async (eventType: 'LOAN_REPAID' | 'LOAN_DEFAULTED') => {
    try {
      await api.post('/v1/score-events', { worker_id: data.worker_id, event_type: eventType });
      alert('Event reported successfully!');
    } catch (err) {
      alert('Failed to report event');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Trust Passport Lookup</h1>
      
      <form onSubmit={handleSearch} className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={code} 
          onChange={e => setCode(e.target.value)}
          placeholder="Enter TP-XXXX-XXX"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-lg"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold">
          <Search className="w-5 h-5" /> Lookup
        </button>
      </form>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><AlertCircle /> {error}</div>}

      {data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{data.worker_name}</h2>
              <p className="text-gray-500">Group: {data.ajo_group}</p>
              <p className="text-sm text-gray-400 mt-1">Valid until: {data.validity}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
              data.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
              data.tier === 'SILVER' ? 'bg-gray-200 text-gray-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              <ShieldCheck className="w-5 h-5" /> {data.tier} TIER
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center justify-center">
              <span className="text-gray-500 font-medium mb-2">Trust Score</span>
              <span className="text-5xl font-black text-blue-600">{data.score}</span>
              <span className="text-sm text-gray-400 mt-2">Max Loan: ₦{data.max_loan}</span>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Score Breakdown</h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Consistency</span>
                <span className="font-semibold">{data.consistency_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Streak</span>
                <span className="font-semibold">{data.streak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Catch-up Rate</span>
                <span className="font-semibold">{data.catch_up_rate}%</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Report Loan Event</h3>
            <div className="flex gap-4">
              <button onClick={() => reportEvent('LOAN_REPAID')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition">
                Mark as Repaid
              </button>
              <button onClick={() => reportEvent('LOAN_DEFAULTED')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition">
                Report Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
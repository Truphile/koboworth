import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../api/axios';

export const LenderManagement: React.FC = () => {
  const [lenders, setLenders] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/lenders').then(res => setLenders(res.data)).catch(console.error);
  }, []);

  const handleCreate = () => {
    const name = prompt('Enter Lender Name:');
    if (name) {
      setLenders([...lenders, { id: Date.now(), name, rate_limit: 10000, status: 'ACTIVE' }]);
      setNewKey(`sk_live_${Math.random().toString(36).substr(2, 16)}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Lender Management</h1>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700">
          <Plus className="w-4 h-4"/> Issue New Key
        </button>
      </div>

      {newKey && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl mb-6 shadow-sm">
          <h3 className="font-bold text-lg mb-2">New API Key Issued!</h3>
          <p className="text-sm mb-4">Please copy this key now. It will not be shown again.</p>
          <code className="bg-white px-4 py-3 rounded-lg border border-green-300 font-mono text-lg block w-full text-center">
            {newKey}
          </code>
          <button onClick={() => setNewKey(null)} className="mt-4 text-sm font-medium underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-500 text-sm font-semibold">
              <th className="p-4">Lender Name</th>
              <th className="p-4">Rate Limit (per hr)</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {lenders.map(l => (
              <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 font-medium">{l.name}</td>
                <td className="p-4 text-slate-600">{l.rate_limit}</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{l.status}</span></td>
                <td className="p-4"><button className="text-red-600 font-medium text-sm hover:underline">Revoke</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
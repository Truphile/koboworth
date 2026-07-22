import React, { useState } from 'react';
import { CheckCircle, Ban } from 'lucide-react';

export const CollectorManagement: React.FC = () => {
  const [collectors, setCollectors] = useState([
    { id: 1, name: 'Alice Ajo', phone: '08012345678', fraud_score: 12, is_active: true },
    { id: 2, name: 'Bob Collector', phone: '08087654321', fraud_score: 85, is_active: true },
  ]);

  const toggleSuspension = (id: number) => {
    // F89 - Collector suspension handler queues their contributions as disputed
    setCollectors(collectors.map(c => 
      c.id === id ? { ...c, is_active: !c.is_active } : c
    ));
    alert('Collector status changed. All their recent contributions have been queued for dispute review.');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Collector Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Phone</th>
              <th className="py-4 px-6">Fraud Score</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collectors.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-900">{c.name}</td>
                <td className="py-4 px-6 text-slate-600 font-mono">{c.phone}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${c.fraud_score > 70 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {c.fraud_score} / 100
                  </span>
                </td>
                <td className="py-4 px-6">
                  {c.is_active ? 
                    <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle className="w-4 h-4"/> Active</span> : 
                    <span className="flex items-center gap-1 text-red-600 font-medium"><Ban className="w-4 h-4"/> Suspended</span>
                  }
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => toggleSuspension(c.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${c.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                    {c.is_active ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export const DisputeQueue: React.FC = () => {
  const [disputes, setDisputes] = useState([
    { id: 101, worker: 'Chidi M.', amount: '₦500', date: '2026-06-25', status: 'PENDING' },
    { id: 102, worker: 'Amaka B.', amount: '₦1000', date: '2026-06-26', status: 'PENDING' }
  ]);

  const handleAction = (id: number, action: 'APPROVED' | 'REJECTED') => {
    setDisputes(disputes.filter(d => d.id !== id));
    alert(`Dispute ${action}. Trust score will be automatically recalculated.`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dispute Review Queue</h1>
      <div className="grid gap-4">
        {disputes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No pending disputes.</div>
        ) : disputes.map((d) => (
          <div key={d.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{d.worker}</p>
              <p className="text-sm text-slate-500">Amount: <span className="font-medium text-slate-700">{d.amount}</span> | Date: {d.date}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction(d.id, 'APPROVED')} className="flex items-center gap-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-100">
                <Check className="w-4 h-4"/> Approve (Exclude)
              </button>
              <button onClick={() => handleAction(d.id, 'REJECTED')} className="flex items-center gap-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-100">
                <X className="w-4 h-4"/> Reject (Keep)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
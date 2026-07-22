import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export const AuditLogs: React.FC = () => {
  const [tab, setTab] = useState<'AUDIT' | 'CONSENT'>('AUDIT');
  const [logs, setLogs] = useState<{audit: any[], consent: any[]}>({ audit: [], consent: [] });

  useEffect(() => {
    api.get('/admin/logs').then(res => setLogs(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setTab('AUDIT')} className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab === 'AUDIT' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>API Audit Logs</button>
          <button onClick={() => setTab('CONSENT')} className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab === 'CONSENT' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Consent Events</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {tab === 'AUDIT' ? (
          <div>
            <div className="flex gap-4 mb-6">
              <input type="text" placeholder="Filter by Lender..." className="border border-slate-300 rounded-lg px-4 py-2 text-sm flex-1" />
              <input type="text" placeholder="Response Code (e.g. 200, 401)" className="border border-slate-300 rounded-lg px-4 py-2 text-sm w-48" />
            </div>
            <div className="text-sm font-mono bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto h-96">
              {logs.audit.map(log => (
                <div key={log.id}>{log.log}</div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-4 mb-6">
              <input type="text" placeholder="Worker Phone..." className="border border-slate-300 rounded-lg px-4 py-2 text-sm flex-1" />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm border-b">
                  <th className="pb-3">Worker ID</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Lender Ref</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.consent.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 font-mono">{c.worker_id}</td>
                    <td className={`py-3 font-bold ${c.action === 'GRANTED' ? 'text-green-600' : 'text-red-600'}`}>{c.action}</td>
                    <td className="py-3">{c.lender}</td>
                    <td className="py-3 text-slate-500">{c.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
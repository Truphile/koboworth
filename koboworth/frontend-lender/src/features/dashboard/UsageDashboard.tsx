import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Database, AlertTriangle } from 'lucide-react';

export const UsageDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // F74 Mock API call
    setStats({
      totalQueries: 1240,
      quotaRemaining: 8760,
      limit: 10000,
      distribution: [
        { name: 'GOLD', value: 400 },
        { name: 'SILVER', value: 600 },
        { name: 'BRONZE', value: 240 }
      ],
      history: [
        { id: 1, code: 'TP-ABCD-123', time: '2026-06-26 10:00:00', status: 'SUCCESS' },
        { id: 2, code: 'TP-WXYZ-789', time: '2026-06-26 09:45:00', status: 'SUCCESS' },
        { id: 3, code: 'TP-INVALID', time: '2026-06-26 09:30:00', status: 'DENIED' },
      ]
    });
  }, []);

  if (!stats) return <div className="p-6 text-gray-900 dark:text-white">Loading...</div>;

  const COLORS = ['#eab308', '#9ca3af', '#c2410c'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">API Usage Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg"><Activity className="text-blue-600 dark:text-blue-400" /></div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Total Queries</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQueries}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg"><Database className="text-green-600 dark:text-green-400" /></div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Remaining Quota</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.quotaRemaining}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg"><AlertTriangle className="text-orange-600 dark:text-orange-400" /></div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Rate Limit</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">Healthy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-1">
          <h2 className="font-semibold mb-4 text-gray-700 dark:text-slate-200">Tier Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.distribution.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm mt-4 text-gray-600 dark:text-slate-300">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Gold</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded-full"></div> Silver</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-600 rounded-full"></div> Bronze</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-2">
          <h2 className="font-semibold mb-4 text-gray-700 dark:text-slate-200">Query History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 text-sm">
                  <th className="pb-3 px-4">Passport Code</th>
                  <th className="pb-3 px-4">Timestamp</th>
                  <th className="pb-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.history.map((row: any) => (
                  <tr key={row.id} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-slate-300">
                    <td className="py-3 px-4 font-mono text-sm">{row.code}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-slate-400 text-sm">{row.time}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${row.status === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

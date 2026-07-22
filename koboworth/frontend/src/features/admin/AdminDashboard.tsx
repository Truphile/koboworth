import React, { useState, useEffect } from 'react';
import { Shield, MessageSquare, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/complaints');
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (id: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:8000/admin/complaints/${id}/status`, { status: newStatus });
      fetchComplaints();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              IT Support Hub
            </h1>
            <p className="text-slate-500 mt-2">Manage user support tickets and system complaints.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-4 rounded-xl"><AlertTriangle className="w-6 h-6 text-orange-600" /></div>
              <div>
                <p className="text-slate-500 font-medium">Open Tickets</p>
                <h3 className="text-3xl font-bold text-slate-900">{complaints.filter(c => c.status === 'OPEN').length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-xl"><Clock className="w-6 h-6 text-blue-600" /></div>
              <div>
                <p className="text-slate-500 font-medium">In Progress</p>
                <h3 className="text-3xl font-bold text-slate-900">{complaints.filter(c => c.status === 'IN_PROGRESS').length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-xl"><CheckCircle className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-slate-500 font-medium">Resolved</p>
                <h3 className="text-3xl font-bold text-slate-900">{complaints.filter(c => c.status === 'RESOLVED').length}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-400" /> Recent Complaints
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading tickets...</td></tr>
                ) : complaints.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">No support tickets found.</td></tr>
                ) : complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.worker_name}</div>
                      <div className="text-sm text-slate-500">{c.worker_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{c.subject}</div>
                      <div className="text-sm text-slate-500 max-w-xs truncate" title={c.description}>{c.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'OPEN' ? 'bg-orange-100 text-orange-800' :
                        c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {c.status !== 'IN_PROGRESS' && c.status !== 'RESOLVED' && (
                          <button onClick={() => handleResolve(c.id, 'IN_PROGRESS')} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                            Investigate
                          </button>
                        )}
                        {c.status !== 'RESOLVED' && (
                          <button onClick={() => handleResolve(c.id, 'RESOLVED')} className="text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                            Mark Resolved
                          </button>
                        )}
                      </div>
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

import React from 'react';
import { Database, Server, Smartphone, Activity } from 'lucide-react';

export const SystemHealth: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Platform Health & Metrics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-lg"><Database className="text-blue-600 w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm">PostgreSQL</p><p className="text-xl font-bold text-green-600">CONNECTED</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-lg"><Server className="text-purple-600 w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm">Redis Queue Depth</p><p className="text-xl font-bold text-slate-900">14</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-lg"><Activity className="text-orange-600 w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm">Celery Workers</p><p className="text-xl font-bold text-slate-900">4 Active</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-lg"><Smartphone className="text-green-600 w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm">SMS Delivery Rate</p><p className="text-xl font-bold text-slate-900">99.8%</p></div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-green-400"/> Live Server Terminal</h3>
        <div className="font-mono text-sm text-slate-300 space-y-1 h-64 overflow-y-auto">
          <p>[INFO] Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)</p>
          <p>[INFO] Started server process [12401]</p>
          <p className="text-green-400">[INFO] Application startup complete.</p>
          <p>[INFO] POST /ussd/session 200 OK</p>
          <p>[INFO] GET /health 200 OK</p>
          <p>[INFO] Celery task recalculate_score(worker_id=91) succeeded in 0.45s</p>
        </div>
      </div>
    </div>
  );
};
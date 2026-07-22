import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { ShieldCheck, AlertOctagon, XCircle, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const PublicVerification: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'LOADING' | 'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND'>('LOADING');

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        // Fetch real worker details using the passport code
        const workerRes = await api.get(`/workers/passport-lookup/${code}`);
        const worker = workerRes.data;
        
        // Fetch trust score and tier
        const dashboardRes = await api.get(`/workers/${worker.id}/dashboard`);
        const dashboard = dashboardRes.data;
        
        setData({
          worker_name: `${worker.first_name} ${worker.last_name}`,
          tier: dashboard.trustScore > 0 ? dashboard.tier : 'UNRATED',
          score: dashboard.trustScore || 0,
          max_loan: dashboard.trustScore > 600 ? '100,000' : dashboard.trustScore > 300 ? '50,000' : '0',
          validity: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          status: 'VALID'
        });
        setStatus('VALID');
      } catch (err: any) {
        setStatus('NOT_FOUND');
      }
    };
    if (code) fetchPassport();
  }, [code]);

  if (status === 'LOADING') return <div className="min-h-screen flex items-center justify-center">Loading verification data...</div>;

  if (status === 'NOT_FOUND') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 print:bg-white">
      <div className="text-center p-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Passport Not Found</h1>
        <p className="text-gray-500 mt-2">The passport code {code} is invalid or does not exist.</p>
      </div>
    </div>
  );

  if (status === 'REVOKED') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 print:bg-white">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border-t-4 border-red-500 print:shadow-none print:border-0">
        <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
        {/* F85 Revoked passport state */}
        <p className="text-gray-600 bg-red-50 p-4 rounded-lg font-medium">Access restricted by holder.</p>
      </div>
    </div>
  );

  if (status === 'EXPIRED') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 print:bg-white">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border-t-4 border-orange-500 print:shadow-none print:border-0">
        <AlertOctagon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Passport Expired</h1>
        {/* F84 Expired passport state */}
        <p className="text-gray-600 bg-orange-50 p-4 rounded-lg font-medium">
          This passport expired on {data?.expiry_date || 'a previous date'}.
        </p>
      </div>
    </div>
  );

  // F83 Valid passport display
  // F86 Print-optimised CSS
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 print:bg-white print:py-0 print:px-0 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">Koboworth Verification</h1>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            <Printer className="w-4 h-4" /> Print A5
          </button>
        </div>

        {/* Print-optimized A5 container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:w-[148mm] print:h-[210mm] print:mx-auto border border-gray-100 print:border-0">
          <div className="bg-blue-600 p-8 text-white flex justify-between items-center print:bg-black print:text-black print:-webkit-print-color-adjust-exact">
            <div>
              <p className="text-blue-200 font-medium tracking-widest text-sm mb-1 uppercase">Official Trust Passport</p>
              <h2 className="text-3xl font-bold">{data?.worker_name || 'Worker Name'}</h2>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30 print:border-gray-800 print:bg-white print:text-black">
              <span className="font-mono text-lg font-bold">{code}</span>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-1">Assigned Tier</p>
                <div className={`inline-flex px-4 py-2 rounded-full font-bold items-center gap-2 ${
                  data?.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800 print:border print:border-yellow-800' :
                  data?.tier === 'SILVER' ? 'bg-gray-200 text-gray-800 print:border print:border-gray-800' :
                  'bg-orange-100 text-orange-800 print:border print:border-orange-800'
                }`}>
                  <ShieldCheck className="w-5 h-5" /> {data?.tier || 'GOLD'} TIER
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-1">Validity Period</p>
                <p className="font-medium text-gray-900">{data?.validity || 'Valid'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 border-y border-gray-100 py-8 print:border-gray-300">
              <div>
                <p className="text-gray-500 text-sm mb-1">Verified Trust Score</p>
                <p className="text-5xl font-black text-blue-600 print:text-black">{data?.score || '0'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Max Eligible Loan</p>
                <p className="text-3xl font-bold text-green-600 print:text-black">₦{data?.max_loan || '0'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-12">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg p-2 border border-gray-200">
                  {/* F83 QR Code representation */}
                  <QRCodeSVG value={`${window.location.origin}/p/${code}`} size={78} />
                </div>
                <div className="text-sm text-gray-500 max-w-xs">
                  Scan this QR code or visit <strong className="text-gray-900 font-mono">{window.location.host}/p/{code}</strong> to verify the authenticity of this document.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

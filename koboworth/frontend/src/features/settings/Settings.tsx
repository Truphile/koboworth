import React, { useState } from 'react';
import { Key, AlertTriangle } from 'lucide-react';

export const Settings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [rotated, setRotated] = useState(false);

  const handleRotate = () => {
    setRotated(true);
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Settings</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Production API Key</h2>
            <p className="text-sm text-gray-500 mb-4">Use this key to authenticate your requests to the Koboworth Lender API.</p>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm border border-gray-200">
              <Key className="w-4 h-4 text-gray-400" />
              <span>{rotated ? 'sk_live_...NEW8' : 'sk_live_...A4F9'}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition">
            Rotate Key
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Rotate API Key?</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to rotate your API key? This will immediately invalidate your existing key and any integrations using it will break until updated.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">
                Cancel
              </button>
              <button 
                onClick={handleRotate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
                Yes, Rotate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
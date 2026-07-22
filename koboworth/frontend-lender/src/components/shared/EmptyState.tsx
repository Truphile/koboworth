import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState: React.FC<{ message?: string }> = ({ message = 'No data available' }) => (
  <div className="w-full bg-white rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
    <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
    <h3 className="text-lg font-bold text-gray-700 mb-1">Nothing here yet</h3>
    <p className="text-gray-500">{message}</p>
  </div>
);
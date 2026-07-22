import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="w-full bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-100 rounded w-full animate-pulse mt-4"></div>
    ))}
  </div>
);
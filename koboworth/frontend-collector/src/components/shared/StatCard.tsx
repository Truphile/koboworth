import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendValue, icon }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
    {icon && <div className="p-4 rounded-lg bg-gray-50 text-gray-600">{icon}</div>}
    <div className="flex-1">
      <p className="text-gray-500 text-sm">{label}</p>
      <div className="flex items-end gap-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  </div>
);
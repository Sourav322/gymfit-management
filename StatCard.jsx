import React from 'react';

export default function StatCard({ title, value, icon, color = 'orange', subtitle, trend }) {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6 slide-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}

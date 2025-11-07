// components/StatsOverview.jsx
import React from 'react';

const StatsOverview = ({ quotations }) => {
  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'PENDING').length,
    approved: quotations.filter(q => q.status === 'APPROVED').length,
    expired: quotations.filter(q => q.status === 'EXPIRED').length,
  };

  const statCards = [
    {
      label: 'Tổng số',
      value: stats.total,
      color: 'bg-blue-500',
      icon: '📊'
    },
    {
      label: 'Chờ duyệt',
      value: stats.pending,
      color: 'bg-yellow-500',
      icon: '⏳'
    },
    {
      label: 'Đã duyệt',
      value: stats.approved,
      color: 'bg-green-500',
      icon: '✅'
    },
    {
      label: 'Hết hạn',
      value: stats.expired,
      color: 'bg-red-500',
      icon: '📅'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-2xl ${stat.color} bg-gradient-to-br ${stat.color} to-${stat.color.replace('500', '600')}`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${stat.color}`}
                style={{
                  width: `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
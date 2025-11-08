import React from 'react';

/**
 * Component hiển thị trạng thái với màu sắc và icon
 * @param {string} status - Trạng thái từ OrderStatusB2C
 * @param {string} className - CSS class bổ sung
 * @param {boolean} showIcon - Hiển thị icon hay không
 */
const StatusBadge = ({ status, className = '', showIcon = true }) => {
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        label: 'Chờ xử lý',
        icon: '⏳'
      },
      APPROVED: { 
        color: 'bg-blue-100 text-blue-800 border-blue-300', 
        label: 'Đã duyệt',
        icon: '✅'
      },
      CONFIRMED: { 
        color: 'bg-green-100 text-green-800 border-green-300', 
        label: 'Đã xác nhận',
        icon: '📋'
      },
      IN_PRODUCTION: { 
        color: 'bg-purple-100 text-purple-800 border-purple-300', 
        label: 'Đang sản xuất',
        icon: '🏭'
      },
      READY_FOR_DELIVERY: { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300', 
        label: 'Sẵn sàng giao',
        icon: '🚚'
      },
      DELIVERED: { 
        color: 'bg-green-100 text-green-800 border-green-300', 
        label: 'Đã giao',
        icon: '📦'
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-800 border-red-300', 
        label: 'Đã hủy',
        icon: '❌'
      }
    };
    return configs[status] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-300', 
      label: status,
      icon: '📌'
    };
  };

  const { color, label, icon } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color} ${className}`}>
      {showIcon && <span className="mr-2">{icon}</span>}
      <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-70"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
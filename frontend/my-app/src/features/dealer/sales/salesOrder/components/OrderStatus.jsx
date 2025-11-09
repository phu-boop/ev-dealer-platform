import React from 'react';

const OrderStatus = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'APPROVED': return 'bg-blue-500';
      case 'CONFIRMED': return 'bg-green-500';
      case 'IN_PRODUCTION': return 'bg-purple-500';
      case 'READY_FOR_DELIVERY': return 'bg-indigo-500';
      case 'DELIVERED': return 'bg-green-700';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-white text-xs ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default OrderStatus;

import React from 'react';

const DealerCard = ({ dealer, onEdit, onDelete, onSuspend, onActivate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200';
      case 'INACTIVE':
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
      case 'SUSPENDED':
        return 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'SUSPENDED':
        return 'Tạm ngừng';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'INACTIVE':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'SUSPENDED':
        return (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:scale-105">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{dealer.dealerName}</h3>
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block">
            Mã: <span className="font-mono font-medium">{dealer.dealerCode}</span>
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(dealer.status)}`}>
          {getStatusIcon(dealer.status)}
          {getStatusText(dealer.status)}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{dealer.address}, {dealer.city}</span>
        </div>
        
        {dealer.phone && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{dealer.phone}</span>
          </div>
        )}

        {dealer.email && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{dealer.email}</span>
          </div>
        )}

        {dealer.taxNumber && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>MST: {dealer.taxNumber}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        {dealer.status === 'ACTIVE' ? (
          <button
            onClick={() => onSuspend(dealer.dealerId)}
            className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
          >
            Tạm ngừng
          </button>
        ) : (
          <button
            onClick={() => onActivate(dealer.dealerId)}
            className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
          >
            Kích hoạt
          </button>
        )}
        
        <button
          onClick={() => onEdit(dealer)}
          className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
        >
          Sửa
        </button>
        
        <button
          onClick={() => onDelete(dealer.dealerId, dealer.dealerName)}
          className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};
export default DealerCard;
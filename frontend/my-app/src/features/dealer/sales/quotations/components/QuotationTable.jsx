// components/QuotationTable.jsx
import React from 'react';

const QuotationTable = ({ quotations, loading, error, onView, onDelete, canDelete }) => {
  // Format functions và các hàm helper giữ nguyên từ code cũ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      ACCEPTED: 'bg-green-100 text-green-800 border border-green-200',
      APPROVED: 'bg-green-100 text-green-800 border border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border border-red-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border border-gray-200',
      DRAFT: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Chờ duyệt',
      ACCEPTED: 'Đã chấp nhận',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      EXPIRED: 'Hết hạn',
      DRAFT: 'Bản nháp'
    };
    return statusMap[status] || status;
  };

  // Skeleton Loading Rows
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Mã BG', 'Khách hàng', 'Thông tin xe', 'Giá', 'Ngày tạo', 'Hiệu lực', 'Trạng thái', 'Thao tác'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Error và Empty states giữ nguyên từ code cũ, có thể tùy chỉnh thêm
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        {/* Error content từ code cũ */}
      </div>
    );
  }

  if (!quotations.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
        {/* Empty state content từ code cũ */}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80 backdrop-blur-sm">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mã BG
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Thông tin xe
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hiệu lực đến
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quotation) => (
              <tr 
                key={quotation.quotationId} 
                className="hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer"
                onClick={() => onView(quotation)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 font-mono">
                    #{quotation.quotationId?.slice(-8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {quotation.customerInfo ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {quotation.customerInfo.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quotation.customerInfo.phone}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {quotation.modelInfo && quotation.variantInfo ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.modelInfo.brand} {quotation.modelInfo.modelName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {quotation.variantInfo.versionName}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-green-600">
                    {formatCurrency(quotation.finalPrice)}
                  </div>
                  {quotation.discountAmount > 0 && (
                    <div className="text-xs text-red-500 line-through">
                      {formatCurrency(quotation.basePrice)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(quotation.quotationDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(quotation.validUntil)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                    {getStatusText(quotation.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(quotation);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      Xem
                    </button>
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(quotation.quotationId);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationTable;
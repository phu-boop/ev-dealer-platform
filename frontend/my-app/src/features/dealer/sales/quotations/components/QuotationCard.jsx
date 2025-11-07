import React from 'react';

const QuotationCard = ({ quotation, onView, onDelete, canDelete }) => {
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
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      DRAFT: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Báo giá #{quotation.quotationId?.slice(-8)}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(quotation.quotationDate)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
            {quotation.status}
          </span>
        </div>

        {/* Customer Info */}
        {quotation.customerInfo && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Khách hàng</h4>
            <p className="text-sm text-gray-900">{quotation.customerInfo.fullName}</p>
            <p className="text-xs text-gray-500">{quotation.customerInfo.phone}</p>
          </div>
        )}

        {/* Vehicle Info */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Xe</h4>
          {quotation.modelInfo && (
            <p className="text-sm text-gray-900">
              {quotation.modelInfo.brand} - {quotation.modelInfo.modelName}
            </p>
          )}
          {quotation.variantInfo && (
            <p className="text-xs text-gray-600">
              {quotation.variantInfo.versionName} - {quotation.variantInfo.color}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Giá gốc</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(quotation.basePrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Giá cuối</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(quotation.finalPrice)}
            </p>
          </div>
        </div>

        {/* Discount */}
        {quotation.discountAmount > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Giảm giá</p>
            <p className="text-sm font-semibold text-red-600">
              -{formatCurrency(quotation.discountAmount)}
            </p>
          </div>
        )}

        {/* Applied Promotions */}
        {quotation.appliedPromotions && quotation.appliedPromotions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Khuyến mãi áp dụng</p>
            <div className="space-y-1">
              {quotation.appliedPromotions.map((promo, index) => (
                <span
                  key={index}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-2"
                >
                  {promo.promotionName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Validity */}
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            Có hiệu lực đến: {formatDate(quotation.validUntil)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={() => onView(quotation)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Xem chi tiết
          </button>

          {canDelete && (
            <button
              onClick={() => onDelete(quotation.quotationId)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationCard;
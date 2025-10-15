// features/admin/promotions/components/PromotionDetailsModal.js
import React from 'react';
import { XMarkIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';

export const PromotionDetailsModal = ({ promotion, isOpen, onClose, onApprove, onEdit, onDelete }) => {
  if (!isOpen || !promotion) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatDiscountRate = (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      UPCOMING: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác thực' },
      ACTIVE: { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' },
      EXPIRED: { color: 'bg-red-100 text-red-800', text: 'Đã hết hạn' },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', text: 'Không hoạt động' }
    };
    
    const config = statusConfig[status] || statusConfig.UPCOMING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chi tiết Khuyến mãi</h2>
              <p className="text-sm text-gray-500">ID: {promotion.promotionId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên chương trình</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">{promotion.promotionName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <div className="mt-1">{getStatusBadge(promotion.status)}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <p className="mt-1 text-sm text-gray-900">{promotion.description || 'Không có mô tả'}</p>
              </div>
            </div>
          </div>

          {/* Discount Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin Giảm giá</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-green-600">
                  {formatDiscountRate(promotion.discountRate)}
                </span>
                <p className="text-sm text-gray-600 mt-1">Tỷ lệ giảm giá</p>
              </div>
            </div>
          </div>

          {/* Time Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thời gian áp dụng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Bắt đầu</p>
                  <p className="text-sm text-gray-900">{formatDate(promotion.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Kết thúc</p>
                  <p className="text-sm text-gray-900">{formatDate(promotion.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {promotion.applicableModelsJson && promotion.applicableModelsJson !== '[]' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Áp dụng cho</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(promotion.applicableModelsJson), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          {promotion.status === 'UPCOMING' && (
            <button
              onClick={() => onApprove(promotion.promotionId)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Phê duyệt
            </button>
          )}
          <button
            onClick={() => onEdit(promotion)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete(promotion.promotionId, promotion.promotionName)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailsModal;
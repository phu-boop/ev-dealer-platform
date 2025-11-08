import React, { useState, useEffect } from 'react';
import { useOrderTracking } from '../hooks/useOrderTracking';
import StatusBadge from './StatusBadge';

/**
 * Modal để tạo hoặc cập nhật tracking record
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {string} orderId - ID của đơn hàng
 * @param {Object} existingTracking - Tracking record hiện tại (nếu là update)
 * @param {function} onSuccess - Callback khi thành công
 */
const TrackingModal = ({ isOpen, onClose, orderId, existingTracking, onSuccess }) => {
  const { addTracking, updateTracking } = useOrderTracking(orderId);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = [
    'PENDING',
    'APPROVED', 
    'CONFIRMED',
    'IN_PRODUCTION',
    'READY_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  useEffect(() => {
    if (existingTracking) {
      setFormData({
        status: existingTracking.status,
        notes: existingTracking.notes || ''
      });
    } else {
      setFormData({
        status: 'PENDING',
        notes: ''
      });
    }
  }, [existingTracking, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.status) return;

    setSubmitting(true);
    try {
      const updatedBy = sessionStorage.getItem('profileId');
      const trackingData = {
        orderId: orderId,
        status: formData.status,
        notes: formData.notes,
        updatedBy: updatedBy
      };

      if (existingTracking) {
        await updateTracking(existingTracking.trackId, trackingData);
      } else {
        await addTracking(trackingData);
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Lỗi khi lưu tracking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ status: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {existingTracking ? 'Cập nhật trạng thái' : 'Thêm trạng thái mới'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Trạng thái
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.status === status
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} showIcon={false} className="text-xs" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nhập ghi chú về tình trạng đơn hàng..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ghi chú giúp theo dõi chi tiết tình trạng đơn hàng
            </p>
          </div>

          {/* Selected Status Preview */}
          {formData.status && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Trạng thái sẽ được cập nhật:</p>
              <StatusBadge status={formData.status} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!formData.status || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang lưu...' : (existingTracking ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackingModal;
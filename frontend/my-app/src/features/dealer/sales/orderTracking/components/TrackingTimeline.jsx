import React, { useState } from 'react';
import { useOrderTracking } from '../hooks/useOrderTracking';
import OrderStatus from '../../salesOrder/components/OrderStatus';
import NoteForm from './NoteForm';
import { useNavigate } from 'react-router-dom';
/**
 * Component hiển thị timeline trạng thái đơn hàng
 * @param {Array} trackings - Danh sách tracking records
 * @param {Object} currentStatus - Trạng thái hiện tại
 * @param {boolean} loading - Trạng thái loading
 * @param {string} orderId - ID đơn hàng
 * @param {Function} onEditTracking - Hàm callback khi người dùng bấm edit (optional)
 */
const TrackingTimeline = ({ 
  trackings = [], 
  currentStatus, 
  loading, 
  orderId, 
  onEditTracking 
}) => {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const { addNote } = useOrderTracking(orderId);
  const navigate = useNavigate();
  const handleAddNote = async (noteData) => {
    try {
      await addNote(noteData.notes);
      setShowNoteForm(false);
    } catch (error) {
      console.error('Lỗi thêm ghi chú:', error);
    }
  };

  if (loading) {
    return <TimelineSkeleton />;
  }

  const sortedTrackings = [...trackings].sort((a, b) => 
    new Date(b.updateDate) - new Date(a.updateDate)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lịch sử trạng thái</h2>
          {currentStatus && (
            <p className="text-sm text-gray-500 mt-1">
              Trạng thái hiện tại: <span className="font-medium">{getStatusLabel(currentStatus.status)}</span>
            </p>
          )}
        </div>
        <div className=''>
        <button
          onClick={() => navigate(`/dealer/staff/orders/${orderId}/tracking/history`)}
          className="bg-blue-600 mr-3 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors text-sm font-medium"
        >
          Xem chi tiết
        </button>
        <button
          onClick={() => setShowNoteForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          📝 Thêm ghi chú
        </button>

        </div>
      </div>

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <NoteForm
              onSubmit={handleAddNote}
              onCancel={() => setShowNoteForm(false)}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {sortedTrackings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">⏳</div>
            <p className="text-gray-500">Chưa có lịch sử trạng thái</p>
          </div>
        ) : (
          sortedTrackings.map((tracking, index) => (
            <TimelineItem
              key={tracking.trackId}
              tracking={tracking}
              isLatest={index === 0}
              onEditTracking={onEditTracking}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Component cho mỗi item trong timeline
const TimelineItem = ({ tracking, isLatest, onEditTracking }) => {
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      APPROVED: '✅',
      CONFIRMED: '📋',
      IN_PRODUCTION: '🏭',
      READY_FOR_DELIVERY: '🚚',
      DELIVERED: '📦',
      CANCELLED: '❌'
    };
    return icons[status] || '📌';
  };

  return (
    <div className="flex gap-4 group">
      {/* Timeline line và dot */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 ${
          isLatest 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-white border-gray-300 group-hover:border-blue-400'
        } transition-colors z-10`} />
        {!isLatest && (
          <div className="w-0.5 h-full bg-gray-300 group-hover:bg-blue-200 transition-colors -mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${!isLatest && 'border-b border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-lg">{getStatusIcon(tracking.status)}</span>
            <OrderStatus status={tracking.status} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">
              {formatDateTime(tracking.updateDate)}
            </span>
            {onEditTracking && (
              <button
                onClick={() => onEditTracking(tracking)}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                title="Chỉnh sửa trạng thái"
              >
                ✏️
              </button>
            )}
          </div>
        </div>

        {/* Notes */}
        {tracking.notes && (
          <div className="bg-gray-50 rounded-lg p-3 mt-2">
            <p className="text-sm text-gray-700">{tracking.notes}</p>
          </div>
        )}

        {/* Updated By */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500">
            Cập nhật bởi: <span className="font-medium">{tracking.updatedBy ? `NV-${tracking.updatedBy.slice(-8)}` : 'Hệ thống'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Skeleton loading
const TimelineSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="h-9 bg-gray-200 rounded w-28"></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            {item !== 3 && <div className="w-0.5 h-full bg-gray-200 -mt-1"></div>}
          </div>
          <div className="flex-1 pb-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Helper function
const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Chờ xử lý',
    APPROVED: 'Đã duyệt',
    CONFIRMED: 'Đã xác nhận',
    IN_PRODUCTION: 'Đang sản xuất',
    READY_FOR_DELIVERY: 'Sẵn sàng giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy'
  };
  return labels[status] || status;
};

export default TrackingTimeline;

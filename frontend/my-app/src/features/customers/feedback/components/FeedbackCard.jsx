import { FiUser, FiCalendar, FiArrowRight, FiAlertCircle, FiClock, FiFileText } from 'react-icons/fi';
import { COMPLAINT_TYPES, COMPLAINT_SEVERITIES, COMPLAINT_STATUSES, COMPLAINT_CHANNELS } from '../services/feedbackService';

const FeedbackCard = ({ complaint, onViewDetail, onRefresh }) => {
  const typeInfo = COMPLAINT_TYPES[complaint.complaintType] || {};
  const severityInfo = COMPLAINT_SEVERITIES[complaint.severity] || {};
  const statusInfo = COMPLAINT_STATUSES[complaint.status] || {};
  const channelInfo = COMPLAINT_CHANNELS[complaint.channel] || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours}h trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    }
    return formatDate(dateString);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        {/* Left: Code & Type */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
              {typeInfo.icon ? <typeInfo.icon className="w-5 h-5" /> : <FiFileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {complaint.complaintCode}
              </h3>
              <p className="text-sm text-gray-600">{typeInfo.label || complaint.complaintType}</p>
            </div>
          </div>
        </div>

        {/* Right: Status & Severity - Prominent */}
        <div className="flex flex-col items-end space-y-2.5">
          {/* Status Badge - Larger & More Prominent */}
          <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${statusInfo.color || 'bg-gray-100 text-gray-700'}`}>
            {statusInfo.label || complaint.status}
          </span>

          {/* Severity Badge - Larger & More Prominent */}
          <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${severityInfo.color || 'bg-gray-100 text-gray-700'}`}>
            {severityInfo.label || complaint.severity}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center text-sm text-gray-700 mb-3">
        <FiUser className="w-4 h-4 mr-2 text-gray-400" />
        <span className="font-medium">{complaint.customerName || 'N/A'}</span>
        {complaint.customerPhone && (
          <span className="ml-2 text-gray-500">• {complaint.customerPhone}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-2 text-sm">
        {complaint.description || 'Không có mô tả'}
      </p>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <FiCalendar className="w-4 h-4 mr-1.5 text-gray-400" />
          <span>{getTimeAgo(complaint.createdAt)}</span>
        </div>

        {complaint.channel && (
          <div className="flex items-center">
            {channelInfo.icon && <channelInfo.icon className="w-4 h-4 mr-1.5 text-gray-400" />}
            <span>{channelInfo.label || complaint.channel}</span>
          </div>
        )}

        {complaint.assignedStaffName && (
          <div className="flex items-center">
            <FiUser className="w-4 h-4 mr-1.5 text-blue-500" />
            <span>Phụ trách: <span className="font-medium">{complaint.assignedStaffName}</span></span>
          </div>
        )}

        {complaint.severity === 'CRITICAL' && !complaint.firstResponseAt && (
          <div className="flex items-center text-red-600 font-medium">
            <FiAlertCircle className="w-4 h-4 mr-1.5" />
            <span>Cần xử lý gấp!</span>
          </div>
        )}
      </div>

      {/* Resolution Info (if resolved) */}
      {complaint.status === 'RESOLVED' && complaint.resolution && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong className="font-semibold">Giải pháp:</strong> {complaint.resolution}
          </p>
          {complaint.resolvedAt && (
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <FiClock className="w-3 h-3 mr-1" />
              Giải quyết lúc: {formatDate(complaint.resolvedAt)}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={() => onViewDetail(complaint.complaintId)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center text-sm font-semibold shadow-md hover:shadow-lg"
        >
          Xem chi tiết
          <FiArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default FeedbackCard;

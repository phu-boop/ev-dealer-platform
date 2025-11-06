import { useState } from 'react';
import { X, Star, MessageSquare, FileText } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, appointment, onSubmit }) => {
  const [formData, setFormData] = useState({
    feedbackRating: 0,
    feedbackComment: '',
    staffNotes: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.feedbackRating === 0) {
      alert('Vui lòng chọn đánh giá sao!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(appointment.appointmentId, formData);
      // Reset form
      setFormData({
        feedbackRating: 0,
        feedbackComment: '',
        staffNotes: '',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Có lỗi xảy ra khi gửi phản hồi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, feedbackRating: rating });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col relative" style={{ zIndex: 100000 }}>
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-white">Ghi kết quả lái thử</h2>
            <p className="text-sm text-blue-100 mt-1">
              #{appointment.appointmentId} - {appointment.customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Star className="w-4 h-4 inline mr-1" />
              Đánh giá của khách hàng <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || formData.feedbackRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {formData.feedbackRating > 0 && (
                <span className="ml-3 text-lg font-semibold text-gray-700">
                  {formData.feedbackRating}/5
                </span>
              )}
            </div>
            {formData.feedbackRating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {formData.feedbackRating === 5 && '🌟 Xuất sắc!'}
                {formData.feedbackRating === 4 && '😊 Rất tốt!'}
                {formData.feedbackRating === 3 && '🙂 Tốt'}
                {formData.feedbackRating === 2 && '😐 Trung bình'}
                {formData.feedbackRating === 1 && '😞 Cần cải thiện'}
              </p>
            )}
          </div>

          {/* Customer Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Phản hồi của khách hàng
            </label>
            <textarea
              value={formData.feedbackComment}
              onChange={(e) => setFormData({ ...formData, feedbackComment: e.target.value })}
              placeholder="Khách hàng nói gì về trải nghiệm lái thử? (tùy chọn)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ghi lại những nhận xét, ý kiến của khách hàng về xe, dịch vụ...
            </p>
          </div>

          {/* Staff Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Ghi chú của nhân viên
            </label>
            <textarea
              value={formData.staffNotes}
              onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
              placeholder="Đánh giá tiềm năng mua hàng, các bước tiếp theo... (tùy chọn)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ghi chú nội bộ: mức độ quan tâm, khả năng chốt đơn, kế hoạch follow-up...
            </p>
          </div>
          </div>
        </form>

        {/* Action Buttons - Fixed Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="feedback-form"
            disabled={isSubmitting || formData.feedbackRating === 0}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Lưu kết quả
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

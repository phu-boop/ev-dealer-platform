// features/customer/promotions/pages/PromotionDetailsModal.js
import React from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { format, parseISO, differenceInDays, differenceInHours } from 'date-fns';
import { vi } from 'date-fns/locale';

export const PromotionDetailsModal = ({ promotion, isOpen, onClose }) => {
  if (!isOpen || !promotion) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), "dd/MM/yyyy • HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const formatDiscountRate = (rate) => {
    return `${(rate * 100).toFixed(0)}%`;
  };

  const getTimeInfo = () => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (promotion.status === 'ACTIVE') {
      const daysLeft = differenceInDays(endDate, now);
      const hoursLeft = differenceInHours(endDate, now) % 24;
      
      if (daysLeft < 0) return null;
      
      return {
        type: 'active',
        daysLeft,
        hoursLeft,
      };
    } else if (promotion.status === 'UPCOMING') {
      const daysUntil = differenceInDays(startDate, now);
      const hoursUntil = differenceInHours(startDate, now) % 24;
      
      if (daysUntil < 0) return null;
      
      return {
        type: 'upcoming',
        daysUntil,
        hoursUntil
      };
    }
    
    return null;
  };

  const timeInfo = getTimeInfo();
  const isActive = promotion.status === 'ACTIVE';

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>

          {/* Header Content */}
          <div className="text-center">
            {/* Discount Badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 border border-white/30">
              <span className="text-2xl font-bold">
                {formatDiscountRate(promotion.discountRate)}
              </span>
            </div>

            {/* Promotion Name */}
            <h2 className="text-xl font-semibold mb-2 leading-tight">
              {promotion.promotionName}
            </h2>

            {/* Status Badge */}
            <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-medium space-x-1">
              {isActive ? (
                <>
                  <SparklesIcon className="w-3 h-3" />
                  <span>Đang diễn ra</span>
                </>
              ) : (
                <>
                  <ClockIcon className="w-3 h-3" />
                  <span>Sắp diễn ra</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          {promotion.description && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Mô tả</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {promotion.description}
                </p>
              </div>
            </div>
          )}

          {/* Time Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Thời gian</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Start Date */}
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-blue-900">Bắt đầu</div>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {formatDate(promotion.startDate)}
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-green-900">Kết thúc</div>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {formatDate(promotion.endDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          {timeInfo && (
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-4 text-white">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm font-medium">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {timeInfo.type === 'active' ? 'Kết thúc sau' : 'Bắt đầu sau'}
                  </span>
                </div>
                
                <div className="flex justify-center space-x-4 text-2xl font-bold">
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      {timeInfo.type === 'active' ? timeInfo.daysLeft : timeInfo.daysUntil}
                    </div>
                    <div className="text-xs opacity-90 mt-1">ngày</div>
                  </div>
                  <div className="text-xl self-center">:</div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      {timeInfo.type === 'active' ? timeInfo.hoursLeft : timeInfo.hoursUntil}
                    </div>
                    <div className="text-xs opacity-90 mt-1">giờ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditions */}
          {promotion.applicableModelsJson && promotion.applicableModelsJson !== '[]' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Điều kiện</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                  {JSON.stringify(JSON.parse(promotion.applicableModelsJson), null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center pt-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-4">
                {isActive 
                  ? 'Đừng bỏ lỡ cơ hội tuyệt vời này!' 
                  : 'Chương trình sắp bắt đầu!'
                }
              </p>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 rounded-lg font-medium hover:from-slate-700 hover:to-slate-800 transition-all duration-200"
              >
                {isActive ? 'Tận hưởng ưu đãi' : 'Đã hiểu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailsModal;
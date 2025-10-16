// features/customer/promotions/components/PromotionCard.js
import React from 'react';
import { CalendarIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export const PromotionCard = ({ promotion, onViewDetails }) => {
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

  const getStatusInfo = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (promotion.status === 'ACTIVE') {
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      return {
        type: 'active',
        label: 'Đang diễn ra',
        gradient: 'from-emerald-500 to-green-600',
        badgeGradient: 'from-emerald-400 to-green-500',
        cardGradient: 'from-emerald-50/80 to-green-50/60',
        borderColor: 'border-emerald-200/80',
        daysLeft,
        urgency: daysLeft <= 3 ? 'high' : daysLeft <= 7 ? 'medium' : 'low'
      };
    } else if (promotion.status === 'UPCOMING') {
      const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      return {
        type: 'upcoming',
        label: 'Sắp diễn ra',
        gradient: 'from-blue-500 to-cyan-600',
        badgeGradient: 'from-blue-400 to-cyan-500',
        cardGradient: 'from-blue-50/80 to-cyan-50/60',
        borderColor: 'border-blue-200/80',
        daysUntil,
        urgency: 'none'
      };
    } else {
      return {
        type: 'other',
        label: promotion.status,
        gradient: 'from-gray-500 to-gray-600',
        badgeGradient: 'from-gray-400 to-gray-500',
        cardGradient: 'from-gray-50 to-gray-100',
        borderColor: 'border-gray-200',
        urgency: 'none'
      };
    }
  };

  const statusInfo = getStatusInfo(promotion);
  const isActive = promotion.status === 'ACTIVE';

  const getUrgencyBadge = () => {
    if (statusInfo.type === 'active' && statusInfo.urgency === 'high') {
      return (
        <div className="absolute -top-2 -left-2">
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
            🔥 GẤP
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`group relative bg-gradient-to-br ${statusInfo.cardGradient} rounded-2xl shadow-lg hover:shadow-xl border ${statusInfo.borderColor} transition-all duration-500 hover:scale-[1.02] overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-60"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full blur-sm"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full blur-sm"></div>

      {getUrgencyBadge()}

      <div className="relative z-10 p-6">
        {/* Header với badge và discount */}
        <div className="flex items-start justify-between mb-4">
          {/* Status Badge */}
          <div className={`bg-gradient-to-r ${statusInfo.badgeGradient} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center space-x-1`}>
            {statusInfo.type === 'active' && <SparklesIcon className="w-3 h-3" />}
            {statusInfo.type === 'upcoming' && <ClockIcon className="w-3 h-3" />}
            <span>{statusInfo.label}</span>
          </div>

          {/* Discount Circle - Redesigned */}
          <div className="relative">
            <div className={`w-16 h-16 bg-gradient-to-br ${statusInfo.gradient} rounded-2xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-white font-bold text-lg">
                {formatDiscountRate(promotion.discountRate)}
              </span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Promotion Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-800 transition-colors">
          {promotion.promotionName}
        </h3>

        {/* Description */}
        {promotion.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {promotion.description}
          </p>
        )}

        {/* Time Information - Redesigned */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/80 backdrop-blur-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500">Bắt đầu</div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {formatDate(promotion.startDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/80 backdrop-blur-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500">Kết thúc</div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {formatDate(promotion.endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Countdown/Timer Section */}
        {(statusInfo.type === 'active' && statusInfo.daysLeft > 0) && (
          <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/60">
            <div className="flex items-center justify-center space-x-2 text-amber-800">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {statusInfo.urgency === 'high' ? '⏳ Kết thúc sau: ' : 'Còn lại: '}
                <span className={`${statusInfo.urgency === 'high' ? 'text-red-600 animate-pulse' : ''}`}>
                  {statusInfo.daysLeft} ngày
                </span>
              </span>
            </div>
            {statusInfo.urgency === 'high' && (
              <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-red-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (statusInfo.daysLeft / 7) * 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {statusInfo.type === 'upcoming' && statusInfo.daysUntil > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/60">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Bắt đầu sau: <span className="text-blue-600">{statusInfo.daysUntil} ngày</span>
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onViewDetails(promotion)}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r ${statusInfo.gradient} hover:brightness-110 group relative overflow-hidden`}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <span className="relative flex items-center justify-center space-x-2">
            {isActive ? (
              <>
                <SparklesIcon className="w-4 h-4" />
                <span>Xem Ưu Đãi Ngay</span>
              </>
            ) : (
              <>
                <ClockIcon className="w-4 h-4" />
                <span>Xem Thông Tin</span>
              </>
            )}
          </span>
        </button>

        {/* Hover effect line */}
        <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${statusInfo.gradient} group-hover:w-full transition-all duration-500`}></div>
      </div>

      {/* Corner accents */}
      <div className={`absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl ${statusInfo.gradient} rounded-bl-2xl opacity-20`}></div>
      <div className={`absolute bottom-0 left-0 w-6 h-6 bg-gradient-to-tr ${statusInfo.gradient} rounded-tr-2xl opacity-20`}></div>
    </div>
  );
};

export default PromotionCard;
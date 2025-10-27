// features/customer/promotions/components/PromotionCard.js
import React from 'react';
import { CalendarIcon, ClockIcon, SparklesIcon, EyeIcon } from '@heroicons/react/24/outline';
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
        gradient: 'from-blue-500 to-cyan-500',
        hoverGradient: 'from-blue-600 to-cyan-600',
        lightGradient: 'from-blue-50/90 to-cyan-50/70',
        borderColor: 'border-blue-200/60',
        badgeGradient: 'from-blue-400 to-cyan-400',
        daysLeft,
        urgency: daysLeft <= 3 ? 'high' : daysLeft <= 7 ? 'medium' : 'low'
      };
    } else if (promotion.status === 'UPCOMING') {
      const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      return {
        type: 'upcoming',
        label: 'Sắp diễn ra',
        gradient: 'from-purple-500 to-fuchsia-500',
        hoverGradient: 'from-purple-600 to-fuchsia-600',
        lightGradient: 'from-purple-50/90 to-fuchsia-50/70',
        borderColor: 'border-purple-200/60',
        badgeGradient: 'from-purple-400 to-fuchsia-400',
        daysUntil,
        urgency: 'none'
      };
    } else {
      return {
        type: 'other',
        label: promotion.status,
        gradient: 'from-gray-500 to-gray-600',
        lightGradient: 'from-gray-50 to-gray-100',
        borderColor: 'border-gray-200',
        badgeGradient: 'from-gray-400 to-gray-500',
        urgency: 'none'
      };
    }
  };

  const statusInfo = getStatusInfo(promotion);
  const isActive = promotion.status === 'ACTIVE';

  const getUrgencyBadge = () => {
    if (statusInfo.type === 'active' && statusInfo.urgency === 'high') {
      return (
        <div className="absolute -top-3 -left-3 z-20">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-xl shadow-red-500/25 flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
            <span>KẾT THÚC SỚM</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`group relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border ${statusInfo.borderColor} transition-all duration-700 overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-80"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100/30 to-cyan-100/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-100/20 to-fuchsia-100/10 rounded-full blur-xl"></div>

      {getUrgencyBadge()}

      <div className="relative z-10 p-8">
        {/* Header với badge và discount */}
        <div className="flex items-start justify-between mb-6">
          {/* Status Badge */}
          <div className={`bg-gradient-to-r ${statusInfo.badgeGradient} text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg flex items-center space-x-2`}>
            {statusInfo.type === 'active' && <SparklesIcon className="w-4 h-4" />}
            {statusInfo.type === 'upcoming' && <ClockIcon className="w-4 h-4" />}
            <span>{statusInfo.label}</span>
          </div>

          {/* Discount Circle */}
          <div className="relative">
            <div className={`w-20 h-20 bg-gradient-to-br ${statusInfo.gradient} rounded-2xl shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-white/20`}>
              <span className="text-white font-bold text-2xl tracking-tight">
                {formatDiscountRate(promotion.discountRate)}
              </span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Promotion Name */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4 line-clamp-2 group-hover:text-gray-900 transition-colors leading-tight">
          {promotion.promotionName}
        </h3>

        {/* Description */}
        {promotion.description && (
          <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
            {promotion.description}
          </p>
        )}

        {/* Time Information */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl border border-white/80 backdrop-blur-sm shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bắt đầu</div>
              <div className="text-sm font-bold text-gray-800">
                {formatDate(promotion.startDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl border border-white/80 backdrop-blur-sm shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kết thúc</div>
              <div className="text-sm font-bold text-gray-800">
                {formatDate(promotion.endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Countdown/Timer Section */}
        {(statusInfo.type === 'active' && statusInfo.daysLeft > 0) && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  {statusInfo.urgency === 'high' ? '⏳ Kết thúc sau:' : 'Còn lại:'}
                </span>
              </div>
              <span className={`text-lg font-bold ${statusInfo.urgency === 'high' ? 'text-red-600 animate-pulse' : 'text-amber-700'}`}>
                {statusInfo.daysLeft} ngày
              </span>
            </div>
            {statusInfo.urgency === 'high' && (
              <div className="w-full bg-amber-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${Math.min(100, (statusInfo.daysLeft / 7) * 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {statusInfo.type === 'upcoming' && statusInfo.daysUntil > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Bắt đầu sau:</span>
              </div>
              <span className="text-lg font-bold text-purple-700">
                {statusInfo.daysUntil} ngày
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onViewDetails(promotion)}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all duration-500 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r ${statusInfo.gradient} hover:bg-gradient-to-r ${statusInfo.hoverGradient} group relative overflow-hidden border border-white/20`}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <span className="relative flex items-center justify-center space-x-3">
            <EyeIcon className="w-5 h-5" />
            <span className="text-base">
              {isActive ? 'Xem Chi Tiết' : 'Xem Thông Tin'}
            </span>
          </span>
        </button>

        {/* Animated border effect */}
        <div className={`absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r ${statusInfo.gradient} group-hover:w-full group-hover:left-0 transition-all duration-700 rounded-full`}></div>
      </div>

      {/* Corner accents */}
      <div className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl ${statusInfo.gradient} rounded-bl-3xl opacity-10`}></div>
      <div className={`absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr ${statusInfo.gradient} rounded-tr-3xl opacity-10`}></div>
    </div>
  );
};

export default PromotionCard;
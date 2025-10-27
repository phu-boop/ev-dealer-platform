// features/customer/promotions/components/PromotionGrid.js
import React from 'react';
import PromotionCard from './PromotionCard';

export const PromotionGrid = ({ promotions, onViewDetails, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 animate-pulse">
            <div className="flex flex-col items-center">
              {/* Discount circle skeleton */}
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mb-6 border border-gray-300/50"></div>
              
              {/* Status badge skeleton */}
              <div className="h-6 bg-gray-200 rounded-full w-32 mb-4"></div>
              
              {/* Title skeleton */}
              <div className="h-5 bg-gray-200 rounded w-4/5 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-3/5 mb-4"></div>
              
              {/* Description skeleton */}
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
              
              {/* Date skeletons */}
              <div className="h-12 bg-gray-200 rounded-xl w-full mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full mb-6"></div>
              
              {/* Button skeleton */}
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-12 max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-200/50">
            <div className="text-3xl">🎁</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Không có khuyến mãi</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Hiện tại không có chương trình khuyến mãi nào phù hợp với bộ lọc của bạn.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-gray-300 to-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {promotions.map((promotion) => (
        <PromotionCard
          key={promotion.promotionId}
          promotion={promotion}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default PromotionGrid;
// features/customer/promotions/components/PromotionGrid.js
import React from 'react';
import PromotionCard from './PromotionCard';

export const PromotionGrid = ({ promotions, onViewDetails, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có khuyến mãi nào</h3>
          <p className="text-gray-600 mb-4">
            Hiện tại không có chương trình khuyến mãi nào phù hợp với bộ lọc của bạn.
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng quay lại sau hoặc thử bộ lọc khác.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
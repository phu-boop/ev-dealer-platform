// features/customer/promotions/components/PromotionFilter.js
import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

const filterOptions = [
  { 
    value: 'ALL', 
    label: 'Tất cả', 
    emoji: '🎁',
    gradient: 'from-purple-100 to-pink-100',
    selectedGradient: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  { 
    value: 'ACTIVE', 
    label: 'Đang diễn ra', 
    emoji: '🔥',
    gradient: 'from-emerald-100 to-green-100',
    selectedGradient: 'from-emerald-500 to-green-500',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700'
  },
  { 
    value: 'UPCOMING', 
    label: 'Sắp diễn ra', 
    emoji: '⏰',
    gradient: 'from-blue-100 to-cyan-100',
    selectedGradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
];

export const PromotionFilter = ({ 
  selectedFilter, 
  onFilterChange, 
  activePromotionsCount, 
  upcomingPromotionsCount,
  totalCount 
}) => {
  const getCount = (filterValue) => {
    switch (filterValue) {
      case 'ALL': return totalCount;
      case 'ACTIVE': return activePromotionsCount;
      case 'UPCOMING': return upcomingPromotionsCount;
      default: return 0;
    }
  };

  const getFilterConfig = (filterValue) => {
    return filterOptions.find(option => option.value === filterValue) || filterOptions[0];
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100/80 p-8 mb-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-50 to-cyan-50 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border border-purple-200/50">
              <FunnelIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Bộ lọc Khuyến mãi</h2>
              <p className="text-sm text-gray-500">Lựa chọn loại ưu đãi bạn quan tâm</p>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((filter) => {
              const count = getCount(filter.value);
              const isSelected = selectedFilter === filter.value;
              const config = getFilterConfig(filter.value);
              
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`group relative flex items-center px-5 py-3 rounded-2xl border-2 transition-all duration-300 ease-out overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-r ${config.selectedGradient} border-transparent text-white shadow-lg shadow-${config.textColor.split('-')[1]}-200/50`
                      : `bg-white/60 backdrop-blur-sm ${config.borderColor} hover:shadow-md hover:scale-105 text-gray-600`
                  }`}
                >
                  {/* Hover shine effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
                    isSelected ? 'opacity-30' : 'opacity-0'
                  }`}></div>
                  
                  {/* Content */}
                  <div className="flex items-center space-x-3 relative z-10">
                    <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${
                      isSelected ? 'filter brightness-0 invert' : ''
                    }`}>
                      {filter.emoji}
                    </span>
                    
                    <span className={`font-medium whitespace-nowrap ${
                      isSelected ? 'text-white' : config.textColor
                    }`}>
                      {filter.label}
                    </span>
                    
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white/20 text-white backdrop-blur-sm' 
                        : `${config.gradient} ${config.textColor} border ${config.borderColor}`
                    }`}>
                      {count}
                    </span>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicator */}
        <div className="mt-6 pt-6 border-t border-gray-100/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Đang hoạt động: <strong className="text-gray-700">{activePromotionsCount}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Sắp diễn ra: <strong className="text-gray-700">{upcomingPromotionsCount}</strong></span>
              </div>
            </div>
            
            {selectedFilter !== 'ALL' && (
              <button
                onClick={() => onFilterChange('ALL')}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Xóa bộ lọc</span>
                <span className="text-xs">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle border glow effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-100/30 via-pink-100/20 to-blue-100/30 opacity-0 transition-opacity duration-500 ${
        selectedFilter !== 'ALL' ? 'opacity-100' : ''
      }`}></div>
    </div>
  );
};

export default PromotionFilter;
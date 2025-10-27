// features/customer/promotions/components/PromotionFilter.js
import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

const filterOptions = [
  { 
    value: 'ACTIVE', 
    label: 'Đang diễn ra', 
    emoji: '⚡',
    gradient: 'from-blue-500 to-cyan-500',
    hoverGradient: 'from-blue-600 to-cyan-600',
    lightGradient: 'from-blue-50/80 to-cyan-50/60',
    borderColor: 'border-blue-200/60',
    textColor: 'text-blue-700'
  },
  { 
    value: 'UPCOMING', 
    label: 'Sắp diễn ra', 
    emoji: '🕒',
    gradient: 'from-purple-500 to-fuchsia-500',
    hoverGradient: 'from-purple-600 to-fuchsia-600',
    lightGradient: 'from-purple-50/80 to-fuchsia-50/60',
    borderColor: 'border-purple-200/60',
    textColor: 'text-purple-700'
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
      case 'ACTIVE': return activePromotionsCount;
      case 'UPCOMING': return upcomingPromotionsCount;
      default: return 0;
    }
  };

  const getFilterConfig = (filterValue) => {
    return filterOptions.find(option => option.value === filterValue) || filterOptions[0];
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 mb-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/40 to-cyan-100/30 rounded-full -translate-y-20 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-100/30 to-fuchsia-100/20 rounded-full translate-y-16 -translate-x-16"></div>
      
      {/* Animated background dots */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/20 rounded-full animate-float"
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 40}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${6 + i * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl border border-blue-200/50 shadow-sm">
              <FunnelIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Lọc Khuyến Mãi</h2>
              <p className="text-gray-500 text-sm">Chọn loại ưu đãi bạn muốn xem</p>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4">
            {filterOptions.map((filter) => {
              const count = getCount(filter.value);
              const isSelected = selectedFilter === filter.value;
              const config = getFilterConfig(filter.value);
              
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`group relative flex items-center px-6 py-4 rounded-2xl border-2 transition-all duration-500 ease-out overflow-hidden min-w-[140px] justify-center ${
                    isSelected
                      ? `bg-gradient-to-r ${config.gradient} border-transparent text-white shadow-xl shadow-blue-500/25`
                      : `bg-white/60 backdrop-blur-sm ${config.borderColor} hover:shadow-lg hover:scale-105 text-gray-600 hover:bg-white/80`
                  }`}
                >
                  {/* Hover shine effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
                    isSelected ? 'opacity-50' : 'opacity-0'
                  }`}></div>
                  
                  {/* Content */}
                  <div className="flex items-center space-x-3 relative z-10">
                    <span className={`text-xl transition-all duration-300 group-hover:scale-110 ${
                      isSelected ? 'filter brightness-0 invert drop-shadow-sm' : 'drop-shadow-sm'
                    }`}>
                      {filter.emoji}
                    </span>
                    
                    <div className="flex flex-col items-start">
                      <span className={`font-semibold whitespace-nowrap text-sm ${
                        isSelected ? 'text-white' : config.textColor
                      }`}>
                        {filter.label}
                      </span>
                      <span className={`text-xs mt-1 ${
                        isSelected ? 'text-white/90' : 'text-gray-500'
                      }`}>
                        {count} ưu đãi
                      </span>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8 pt-8 border-t border-gray-200/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-3 bg-blue-50/50 rounded-2xl px-4 py-2.5 border border-blue-200/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium">Đang hoạt động:</span>
                </div>
                <span className="text-blue-600 font-bold text-lg">{activePromotionsCount}</span>
              </div>
              
              <div className="flex items-center space-x-3 bg-purple-50/50 rounded-2xl px-4 py-2.5 border border-purple-200/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Sắp diễn ra:</span>
                </div>
                <span className="text-purple-600 font-bold text-lg">{upcomingPromotionsCount}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="h-6 w-px bg-gray-300/60"></div>
              <span className="text-xs bg-gray-100/50 rounded-full px-3 py-1.5 border border-gray-200/30">
                Tổng cộng: <strong className="text-gray-700">{totalCount}</strong> ưu đãi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle border glow effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-100/20 via-purple-100/10 to-cyan-100/20 opacity-0 transition-opacity duration-500 ${
        selectedFilter ? 'opacity-100' : ''
      }`}></div>
    </div>
  );
};

export default PromotionFilter;
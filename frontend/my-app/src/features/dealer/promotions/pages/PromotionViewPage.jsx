// features/customer/promotions/pages/PromotionViewPage.js
import React, { useState } from 'react';
import { useCustomerPromotions } from '../hooks/useCustomerPromotions';
import PromotionFilter from '../components/PromotionFilter';
import PromotionGrid from '../components/PromotionGrid';
import PromotionDetailsModal from './PromotionDetailsModal';
import { 
  GiftIcon, 
  FireIcon, 
  ClockIcon,
  ArrowPathIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

export const PromotionViewPage = () => {
  const {
    promotions,
    allPromotions,
    loading,
    error,
    filter,
    setFilter,
    activePromotionsCount,
    upcomingPromotionsCount,
    refresh,
    lastUpdated,
  } = useCustomerPromotions();

  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-200/50">
            <div className="text-2xl">😔</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Đã có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
          <button
            onClick={refresh}
            className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-2xl font-medium hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
            <div className=''>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        
                    <div className="inline-flex items-center justify-center mr-4 w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-3xl shadow-sm border border-violet-200/50 mb-6">
                        <GiftIcon className="h-8 w-8 text-violet-600" />
                    </div>
                        Ưu Đãi & Khuyến Mãi
                    </h1>
            </div>
          
        {/* Filter Section */}
        <PromotionFilter
          selectedFilter={filter}
          onFilterChange={setFilter}
          activePromotionsCount={activePromotionsCount}
          upcomingPromotionsCount={upcomingPromotionsCount}
          totalCount={promotions.length}
        />

          
         
        </div>


        {/* Refresh and Info Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Đang hoạt động</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Sắp diễn ra</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Cập nhật: {formatLastUpdated(lastUpdated)}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center px-5 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-300 disabled:opacity-50 shadow-sm"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {loading ? 'Đang tải...' : 'Làm mới'}
            </span>
          </button>
        </div>

        {/* Promotions Grid */}
        <PromotionGrid
          promotions={promotions}
          onViewDetails={handleViewDetails}
          loading={loading}
        />

        {/* Empty State */}
        {!loading && promotions.length === 0 && (
          <div className="flex justify-center items-center py-16 px-4">
            <div className="text-center max-w-md">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200/50">
                <div className="text-4xl">🎯</div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {filter === 'ACTIVE' ? 'Chưa có ưu đãi đang diễn ra' : 
                   filter === 'UPCOMING' ? 'Chưa có ưu đãi sắp tới' : 
                   'Không tìm thấy ưu đãi nào'}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {filter === 'ACTIVE' ? 
                    'Các chương trình ưu đãi đang hoạt động sẽ xuất hiện tại đây. Vui lòng quay lại sau!' :
                    filter === 'UPCOMING' ?
                    'Các ưu đãi sắp diễn ra sẽ được hiển thị tại đây. Hãy theo dõi để không bỏ lỡ!' :
                    'Hãy thử thay đổi bộ lọc để khám phá thêm nhiều ưu đãi hấp dẫn.'}
                </p>

                {filter !== 'ALL' && (
                  <button
                    onClick={() => setFilter('ALL')}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-2xl font-medium hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-sm text-sm"
                  >
                    Xem tất cả ưu đãi
                  </button>
                )}
              </div>

              {/* Decorative Dots */}
              <div className="mt-8 flex justify-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal chi tiết */}
        <PromotionDetailsModal
          promotion={selectedPromotion}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default PromotionViewPage;
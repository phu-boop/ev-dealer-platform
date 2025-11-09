// pages/QuotationListPage.jsx
import React, { useState, useEffect } from 'react';
import { useQuotations } from '../hooks/useQuotations.js';
import QuotationTable from '../components/QuotationTable';
import QuotationModal from '../components/QuotationModal';
import FilterPanel from '../components/FilterPanel';
import StatsOverview from '../components/StatsOverview';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const QuotationListPage = () => {
  const { 
    quotations, 
    loading, 
    error, 
    filters,
    refetch, 
    deleteQuotation,
    fetchQuotationDetail,
    updateFilters 
  } = useQuotations();
  
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = sessionStorage.getItem('userRole');
  const canDelete = userRole === 'manager';

  // Xử lý tìm kiếm với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchTerm });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, updateFilters]);

  const handleView = async (quotation) => {
    setDetailLoading(true);
    setIsModalOpen(true);
    
    try {
      // Chỉ fetch detail khi click view
      const detail = await fetchQuotationDetail(quotation.quotationId);
      setSelectedQuotation(detail);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết:', err);
      setSelectedQuotation(quotation); // Fallback to basic data
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (quotationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      const success = await deleteQuotation(quotationId);
      if (success) {
        console.log('Xóa báo giá thành công');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuotation(null);
  };

  const handleFilterApply = (newFilters) => {
    updateFilters(newFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    updateFilters({
      status: '',
      customer: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Danh sách báo giá
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Quản lý và xem tất cả báo giá {userRole === 'staff' ? 'của bạn' : 'của đại lý'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Bộ lọc
              </button>
              
              <button
                onClick={refetch}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                placeholder="Tìm kiếm theo mã báo giá, tên khách hàng, số điện thoại..."
              />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel 
            filters={filters}
            onApply={handleFilterApply}
            onClear={handleClearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Stats Overview */}
        <StatsOverview quotations={quotations} />

        {/* Quotation Table */}
        <div className="mt-8">
          <QuotationTable
            quotations={quotations}
            loading={loading}
            error={error}
            onView={handleView}
            onDelete={handleDelete}
            canDelete={canDelete}
          />
        </div>

        {/* Modal */}
        <QuotationModal
          quotation={selectedQuotation}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          loading={detailLoading}
        />
      </div>
    </div>
  );
};

export default QuotationListPage;
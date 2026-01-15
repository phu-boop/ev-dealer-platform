import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import VehicleGrid from "../components/home/VehicleGrid";
import VehicleFilterSidebar from "../components/vehicles/VehicleFilterSidebar";
import { searchVehicles, getVehicles } from "../services/vehicleService";
import { toast } from "react-toastify";

export default function VehiclesPage() {
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    brands: [],
    minRange: null,
    maxRange: null,
    colors: [],
    status: null,
    page: 0,
    size: 12,
    sort: null // No default sort, let backend use its default
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Check if we have active filters (including sort selection)
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRange ||
      filters.maxRange ||
      filters.brands.length > 0 ||
      filters.colors.length > 0 ||
      filters.status ||
      filters.sort // Any sort selection is considered an active filter
    );
  }, [filters, searchTerm]);

  // Convert filters to API parameters
  const searchParams = useMemo(() => {
    const params = {
      page: filters.page,
      size: filters.size,
    };

    // Only add sort parameters if sort is selected
    if (filters.sort) {
      const [sortField, sortDirection] = filters.sort.split(',');
      params.sortBy = sortField === 'price' ? 'basePrice' :
        sortField === 'rangeKm' ? 'baseRangeKm' :
          sortField === 'motorPower' ? 'motorPower' : 'modelName';
      params.direction = sortDirection?.toUpperCase() || 'ASC';
    }

    if (searchTerm) params.keyword = searchTerm;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minRange) params.minRange = filters.minRange;
    if (filters.maxRange) params.maxRange = filters.maxRange;
    if (filters.status) params.status = filters.status;

    return params;
  }, [filters, searchTerm]);

  // Fetch vehicles with filters
  const { data: vehiclesData, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles', searchParams, hasActiveFilters],
    queryFn: async () => {
      try {
        if (hasActiveFilters) {
          // Use searchVehicles when filters are active
          const response = await searchVehicles(searchParams);
          return response.data || { content: [], totalElements: 0 };
        } else {
          // Use getVehicles without sort parameter (backend doesn't support 'price,asc' format)
          // Backend will use default sorting
          const response = await getVehicles(filters.page, filters.size, null);
          return response.data || { content: [], totalElements: 0 };
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Không thể tải danh sách xe");
        return { content: [], totalElements: 0 };
      }
    },
  });

  const vehicles = vehiclesData?.content || [];
  const totalVehicles = vehiclesData?.totalElements || 0;
  const totalPages = vehiclesData?.totalPages || 0;

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, page: 0 }));
  };

  const handleSortChange = (sortValue) => {
    setFilters(prev => ({ ...prev, sort: sortValue, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      brands: [],
      minRange: null,
      maxRange: null,
      colors: [],
      status: null,
      page: 0,
      size: 12,
      sort: null
    });
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Khám phá Xe Điện</h1>
          <p className="text-lg text-blue-100">
            Tìm kiếm và so sánh các mẫu xe điện hiện đại nhất
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm xe điện..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Sort */}
            <select
              value={filters.sort || ""}
              onChange={(e) => handleSortChange(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sắp xếp mặc định</option>
              <option value="price,asc">Giá: Thấp đến Cao</option>
              <option value="price,desc">Giá: Cao đến Thấp</option>
              <option value="rangeKm,desc">Phạm vi: Cao nhất</option>
              <option value="motorPower,desc">Công suất: Cao nhất</option>
            </select>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
            </button>
          </div>

          {/* Active Filters Display */}
          {(filters.colors.length > 0 || filters.minPrice || filters.maxPrice) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.colors.map(color => (
                <span key={color} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {color}
                </span>
              ))}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {filters.minPrice?.toLocaleString('vi-VN')} - {filters.maxPrice?.toLocaleString('vi-VN')} VNĐ
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
            <VehicleFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Vehicle Grid */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold text-gray-900">{totalVehicles}</span> xe điện
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">Đã xảy ra lỗi khi tải dữ liệu</p>
                <button
                  onClick={() => refetch()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && vehicles.length === 0 && (
              <div className="text-center py-20">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xl text-gray-600 mb-2">Không tìm thấy xe nào</p>
                <p className="text-gray-500 mb-4">Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Vehicle Grid */}
            {!isLoading && vehicles.length > 0 && (
              <>
                <VehicleGrid vehicles={vehicles} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 0}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`px-4 py-2 border rounded-lg transition-colors ${filters.page === index
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= totalPages - 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div >
  );
}

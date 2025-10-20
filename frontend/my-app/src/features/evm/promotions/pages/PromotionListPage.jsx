// pages/PromotionListPage.js (Updated version)
import React, { useEffect, useState } from "react";
import { promotionService } from "../services/promotionService";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function PromotionListPage({ onCreate }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    expired: 0,
    inactive: 0
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [promotions]);

  const loadPromotions = () => {
    setLoading(true);
    promotionService.getAll()
      .then((res) => {
        const promotionsWithAutoStatus = res.data.map(promo => ({
          ...promo,
          autoStatus: calculateAutoStatus(promo)
        }));
        setPromotions(promotionsWithAutoStatus);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const calculateAutoStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (isBefore(now, startDate)) return "DRAFT";
    if (isAfter(now, endDate)) return "EXPIRED";
    if (isAfter(now, startDate) && isBefore(now, endDate)) return "ACTIVE";
    return "INACTIVE";
  };

  const calculateStats = () => {
    const stats = {
      total: promotions.length,
      pending: promotions.filter(p => p.status === "DRAFT" || p.autoStatus === "DRAFT").length,
      active: promotions.filter(p => p.status === "ACTIVE" || p.autoStatus === "ACTIVE").length,
      expired: promotions.filter(p => p.status === "EXPIRED" || p.autoStatus === "EXPIRED").length,
      inactive: promotions.filter(p => p.status === "INACTIVE").length
    };
    setStats(stats);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    if (status === "ALL") {
      loadPromotions();
    } else {
      promotionService.getByStatus(status)
        .then((res) => {
          const promotionsWithAutoStatus = res.data.map(promo => ({
            ...promo,
            autoStatus: calculateAutoStatus(promo)
          }));
          setPromotions(promotionsWithAutoStatus);
        })
        .catch((err) => {
          console.error(err);
          alert("Lỗi khi lọc khuyến mãi!");
        });
    }
  };

  const filteredPromotions = promotions.filter(promotion => 
    promotion.promotionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (promotion) => {
    const displayStatus = promotion.status === "DRAFT" ? "DRAFT" : promotion.autoStatus;
    
    const statusConfig = {
      DRAFT: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        text: "Đang chờ xác thực",
        icon: "⏳"
      },
      ACTIVE: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        text: "Đang hoạt động",
        icon: "✅"
      },
      EXPIRED: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        text: "Đã hết hạn",
        icon: "❌"
      },
      INACTIVE: { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        text: "Không hoạt động",
        icon: "⏸️"
      }
    };
    
    const config = statusConfig[displayStatus] || { 
      color: "bg-gray-100 text-gray-800 border-gray-200", 
      text: displayStatus,
      icon: "❓"
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const formatDiscountRate = (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const getDateStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { color: "text-blue-600", text: "Sắp bắt đầu" };
    if (now > end) return { color: "text-red-600", text: "Đã kết thúc" };
    return { color: "text-green-600", text: "Đang diễn ra" };
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách Khuyến mãi</h1>
              <p className="mt-2 text-sm text-gray-600">
                Xem tất cả các chương trình khuyến mãi hiện có
              </p>
            </div>
            <button
              onClick={onCreate}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tạo khuyến mãi mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ xác thực</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
                <p className="text-2xl font-semibold text-red-600">{stats.expired}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">⏸️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                <p className="text-2xl font-semibold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "Tất cả", color: "gray" },
                { value: "DRAFT", label: "Chờ xác thực", color: "yellow" },
                { value: "ACTIVE", label: "Đang hoạt động", color: "green" },
                { value: "EXPIRED", label: "Đã hết hạn", color: "red" },
                { value: "INACTIVE", label: "Không hoạt động", color: "gray" }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleStatusFilter(filter.value)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === filter.value
                      ? `bg-${filter.color}-100 text-${filter.color}-800 border border-${filter.color}-200`
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin khuyến mãi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giảm giá
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Xem chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPromotions.length > 0 ? (
                      filteredPromotions.map((promotion) => {
                        const dateStatus = getDateStatus(promotion.startDate, promotion.endDate);
                        return (
                          <tr key={promotion.promotionId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {promotion.promotionName}
                                    </p>
                                    <span className={`text-xs font-medium ${dateStatus.color}`}>
                                      • {dateStatus.text}
                                    </span>
                                  </div>
                                  {promotion.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                      {promotion.description}
                                    </p>
                                  )}
                                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                    <span>ID: {promotion.promotionId.substring(0, 8)}...</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-green-600">
                                {formatDiscountRate(promotion.discountRate)}
                              </div>
                              <div className="text-xs text-gray-500">Tỷ lệ giảm</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 space-y-1">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                  <span>{formatDate(promotion.startDate)}</span>
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                  <span>{formatDate(promotion.endDate)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(promotion)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              Không tìm thấy khuyến mãi nào
                            </h3>
                            <p className="text-gray-500 mb-4">
                              {searchTerm || filterStatus !== "ALL" 
                                ? "Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc" 
                                : "Bắt đầu bằng cách tạo khuyến mãi đầu tiên của bạn"
                              }
                            </p>
                            {!searchTerm && filterStatus === "ALL" && (
                              <button
                                onClick={onCreate}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Tạo khuyến mãi đầu tiên
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredPromotions.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{filteredPromotions.length}</span> khuyến mãi
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
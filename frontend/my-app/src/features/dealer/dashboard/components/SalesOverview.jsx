import React from "react";
import StatCard from "./StatCard";
import {
  formatCurrency,
  calculateTotalRevenue,
  countOrdersByStatus,
  countQuotationsByStatus,
  calculateConversionRate,
  calculatePercentageChange,
} from "../utils/calculations";
import {
  FiDollarSign,
  FiShoppingCart,
  FiFileText,
  FiTrendingUp,
} from "react-icons/fi";

/**
 * Sales Overview Component
 * Hiển thị tổng quan doanh số
 */
const SalesOverview = ({ 
  orders = [], 
  quotations = [], 
  prevOrders = [], 
  prevQuotations = [] 
}) => {
  // Đảm bảo luôn là mảng
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeQuotations = Array.isArray(quotations) ? quotations : [];
  const safePrevOrders = Array.isArray(prevOrders) ? prevOrders : [];
  const safePrevQuotations = Array.isArray(prevQuotations) ? prevQuotations : [];
  
  console.log("📈 SalesOverview - Input Data:", {
    orders: orders,
    ordersType: typeof orders,
    ordersIsArray: Array.isArray(orders),
    ordersCount: safeOrders.length,
    quotationsCount: safeQuotations.length,
    prevOrdersCount: safePrevOrders.length,
    prevQuotationsCount: safePrevQuotations.length,
    ordersSample: safeOrders.slice(0, 2)
  });
  
  // Tính toán doanh thu
  const currentRevenue = calculateTotalRevenue(safeOrders);
  const prevRevenue = calculateTotalRevenue(safePrevOrders);
  const revenueChange = calculatePercentageChange(currentRevenue, prevRevenue);
  
  console.log("📈 SalesOverview - Calculated:", {
    currentRevenue,
    prevRevenue,
    revenueChange
  });

  // Đếm orders theo trạng thái
  const orderStatusCounts = countOrdersByStatus(safeOrders);
  const totalOrders = safeOrders.length;
  const prevTotalOrders = safePrevOrders.length;
  const ordersChange = calculatePercentageChange(totalOrders, prevTotalOrders);

  // Đếm quotations theo trạng thái
  const quotationStatusCounts = countQuotationsByStatus(safeQuotations);
  const totalQuotations = safeQuotations.length;
  const prevTotalQuotations = safePrevQuotations.length;
  const quotationsChange = calculatePercentageChange(totalQuotations, prevTotalQuotations);

  // Tính conversion rate
  const conversionRate = calculateConversionRate(safeQuotations, safeOrders);
  const prevConversionRate = calculateConversionRate(safePrevQuotations, safePrevOrders);
  const conversionChange = calculatePercentageChange(
    parseFloat(conversionRate),
    parseFloat(prevConversionRate)
  );

  const statCards = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(currentRevenue),
      subtitle: "Tháng này",
      trend: "so với tháng trước",
      trendValue: revenueChange,
      icon: FiDollarSign,
      color: "green",
    },
    {
      title: "Tổng Số Đơn Hàng",
      value: totalOrders,
      subtitle: `${orderStatusCounts.CONFIRMED} đã xác nhận, ${orderStatusCounts.DELIVERED} đã giao`,
      trend: "so với tháng trước",
      trendValue: ordersChange,
      icon: FiShoppingCart,
      color: "blue",
    },
    {
      title: "Số Báo Giá Đã Tạo",
      value: totalQuotations,
      subtitle: `${quotationStatusCounts.SENT} đã gửi, ${quotationStatusCounts.ACCEPTED} đã chấp nhận`,
      trend: "so với tháng trước",
      trendValue: quotationsChange,
      icon: FiFileText,
      color: "purple",
    },
    {
      title: "Tỷ Lệ Chốt Đơn",
      value: `${conversionRate}%`,
      subtitle: "Quotation → Order",
      trend: "so với tháng trước",
      trendValue: conversionChange,
      icon: FiTrendingUp,
      color: "orange",
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tổng Quan Doanh Số</h2>
        <p className="text-gray-600">Thống kê chi tiết về doanh số và đơn hàng</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Chi tiết Orders theo trạng thái */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đơn Hàng Theo Trạng Thái</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{orderStatusCounts.PENDING}</p>
            <p className="text-sm text-gray-600 mt-1">Chờ xử lý</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{orderStatusCounts.CONFIRMED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã xác nhận</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{orderStatusCounts.DELIVERED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã giao</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{orderStatusCounts.APPROVED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã duyệt</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{orderStatusCounts.CANCELLED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã hủy</p>
          </div>
        </div>
        {(orderStatusCounts.IN_PRODUCTION > 0 || orderStatusCounts.IN_TRANSIT > 0 || orderStatusCounts.EDITED > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {orderStatusCounts.IN_PRODUCTION > 0 && (
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{orderStatusCounts.IN_PRODUCTION}</p>
                <p className="text-sm text-gray-600 mt-1">Đang sản xuất</p>
              </div>
            )}
            {orderStatusCounts.IN_TRANSIT > 0 && (
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">{orderStatusCounts.IN_TRANSIT}</p>
                <p className="text-sm text-gray-600 mt-1">Đang vận chuyển</p>
              </div>
            )}
            {orderStatusCounts.EDITED > 0 && (
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{orderStatusCounts.EDITED}</p>
                <p className="text-sm text-gray-600 mt-1">Đã chỉnh sửa</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default SalesOverview;


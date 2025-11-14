import React, { useState, useEffect } from "react";
import SalesOverview from "../components/SalesOverview";
import RevenueChart from "../components/RevenueChart";
import OrdersChart from "../components/OrdersChart";
import OrderStatusChart from "../components/OrderStatusChart";
import TopCustomersChart from "../components/TopCustomersChart";
import ConversionChart from "../components/ConversionChart";
import CongratulationsCard from "../components/CongratulationsCard";
import QuickActions from "../components/QuickActions";
import { fetchDashboardData } from "../services/dashboardService";
import { useAuthContext } from "../../../auth/AuthProvider";
import { FiRefreshCw, FiSearch } from "react-icons/fi";

/**
 * Dashboard Page cho DEALER_MANAGER
 */
const DashboardPage = () => {
  const { fullName, name } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dealerId = sessionStorage.getItem("dealerId") || sessionStorage.getItem("profileId");
      
      console.log("🔑 Dashboard Loading:", {
        dealerId,
        dateRange,
        sessionStorage: {
          dealerId: sessionStorage.getItem("dealerId"),
          profileId: sessionStorage.getItem("profileId"),
          memberId: sessionStorage.getItem("memberId")
        }
      });
      
      if (!dealerId) {
        throw new Error("Không tìm thấy thông tin đại lý");
      }

      const data = await fetchDashboardData(dealerId, dateRange);
      
      console.log("✅ Dashboard Data Received:", {
        ordersCount: data.orders?.length || 0,
        quotationsCount: data.quotations?.length || 0,
        ordersSample: data.orders?.slice(0, 2),
        dateRange: data.dateRange,
        fullData: data
      });
      
      // Đảm bảo orders và quotations luôn là mảng
      const safeData = {
        ...data,
        orders: data.orders || [],
        quotations: data.quotations || [],
        prevOrders: data.prevOrders || [],
        prevQuotations: data.prevQuotations || []
      };
      
      console.log("✅ Safe Data Set:", {
        ordersCount: safeData.orders.length,
        quotationsCount: safeData.quotations.length
      });
      
      setDashboardData(safeData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-600 font-semibold mb-2">Lỗi</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Đảm bảo orders và quotations luôn là mảng
  const safeOrders = Array.isArray(dashboardData.orders) ? dashboardData.orders : [];
  const safeQuotations = Array.isArray(dashboardData.quotations) ? dashboardData.quotations : [];
  const safePrevOrders = Array.isArray(dashboardData.prevOrders) ? dashboardData.prevOrders : [];
  const safePrevQuotations = Array.isArray(dashboardData.prevQuotations) ? dashboardData.prevQuotations : [];

  console.log("📊 DashboardPage Render:", {
    hasDashboardData: !!dashboardData,
    ordersCount: safeOrders.length,
    quotationsCount: safeQuotations.length,
    ordersType: typeof dashboardData.orders,
    ordersIsArray: Array.isArray(dashboardData.orders)
  });

  const userName = fullName || name || "Quản lý";

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header với Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Điều Khiển</h1>
            <p className="text-gray-600">
              Tổng quan doanh số và hoạt động của đại lý
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full md:w-64 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Congratulations Card */}
        <CongratulationsCard
          userName={userName}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Sales Overview */}
        <SalesOverview
          orders={safeOrders}
          quotations={safeQuotations}
          prevOrders={safePrevOrders}
          prevQuotations={safePrevQuotations}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Status Chart */}
          <OrderStatusChart orders={safeOrders} />
          
          {/* Top Customers Chart */}
          <TopCustomersChart orders={safeOrders} />
        </div>

        {/* Orders Chart */}
        <div className="mb-6">
          <OrdersChart orders={safeOrders} />
        </div>

        {/* Conversion Chart */}
        <div className="mb-6">
          <ConversionChart orders={safeOrders} quotations={safeQuotations} />
        </div>

        {/* Revenue Chart */}
        <RevenueChart orders={safeOrders} />
      </div>
    </div>
  );
};

export default DashboardPage;


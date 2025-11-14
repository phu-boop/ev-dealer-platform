/**
 * Admin Dashboard Service
 * Hàm constant để fetch tất cả dữ liệu cần thiết cho admin dashboard
 */
import apiConstSaleService from "../../../../services/apiConstSaleService";
import apiConstPaymentService from "../../../../services/apiConstPaymentService";
import apiConstCustomerService from "../../../../services/apiConstCustomerService";
import { dealerService } from "../../manageDealer/dealers/services/dealerService";

const BASE_ORDER_B2B_URL = "/sales-orders/b2b";
const BASE_ORDER_B2C_URL = "/api/v1/sales-orders/b2c";
const BASE_PAYMENT_DEALER_URL = "/api/v1/payments/dealer";

/**
 * Hàm constant để fetch tất cả dữ liệu admin dashboard
 * @param {Object} dateRange - { startDate, endDate } (optional)
 * @returns {Promise<Object>} Object chứa tất cả dữ liệu
 */
export const fetchAdminDashboardData = async (dateRange = null) => {
  try {
    console.log("🚀 fetchAdminDashboardData called:", { dateRange });
    
    // Tính toán date range nếu không có (tháng hiện tại)
    let startDate, endDate;
    if (!dateRange) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      startDate = firstDayOfMonth.toISOString().split('T')[0];
      endDate = lastDayOfMonth.toISOString().split('T')[0];
    } else {
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    console.log("📅 Date Range:", { startDate, endDate });

    // Fetch tất cả dữ liệu song song
    const [
      dealersResponse,
      customersResponse,
      ordersB2BResponse,
      ordersB2CResponse,
      dealerDebtResponse
    ] = await Promise.allSettled([
      // Fetch tất cả dealers
      dealerService.getAll({ page: 0, size: 1000 }),
      // Fetch tất cả customers
      apiConstCustomerService.get("", { params: { page: 0, size: 1000 } }),
      // Fetch tất cả B2B orders
      apiConstSaleService.get(BASE_ORDER_B2B_URL, {
        params: { page: 0, size: 1000 }
      }),
      // Fetch B2C orders - sẽ fetch sau khi có danh sách dealers
      Promise.resolve({ data: { data: [] } }),
      // Fetch tổng công nợ đại lý
      apiConstPaymentService.get(BASE_PAYMENT_DEALER_URL + "/debt-summary").catch(() => ({ data: { data: [] } }))
    ]);

    // Xử lý dealers
    let dealers = [];
    if (dealersResponse.status === 'fulfilled') {
      const dealerData = dealersResponse.value.data?.data || dealersResponse.value.data;
      if (dealerData?.content) {
        dealers = dealerData.content;
      } else if (Array.isArray(dealerData)) {
        dealers = dealerData;
      }
    }
    
    console.log("🏢 Dealers Response:", {
      status: dealersResponse.status,
      count: dealers.length,
      sample: dealers.slice(0, 2)
    });

    // Đếm dealers theo status
    const dealersByStatus = {
      ACTIVE: dealers.filter(d => d.status === 'ACTIVE' || d.status === 'Active').length,
      INACTIVE: dealers.filter(d => d.status === 'INACTIVE' || d.status === 'Inactive').length,
      SUSPENDED: dealers.filter(d => d.status === 'SUSPENDED' || d.status === 'Suspended').length
    };

    // Xử lý customers
    let customers = [];
    if (customersResponse.status === 'fulfilled') {
      const customerData = customersResponse.value.data?.data || customersResponse.value.data;
      if (customerData?.content) {
        customers = customerData.content;
      } else if (Array.isArray(customerData)) {
        customers = customerData;
      }
    }
    
    console.log("👥 Customers Response:", {
      status: customersResponse.status,
      count: customers.length
    });

    // Xử lý B2B orders
    let ordersB2B = [];
    if (ordersB2BResponse.status === 'fulfilled') {
      const b2bData = ordersB2BResponse.value.data?.data;
      if (b2bData?.content) {
        ordersB2B = b2bData.content;
      } else if (Array.isArray(b2bData)) {
        ordersB2B = b2bData;
      }
    }
    
    console.log("🛒 B2B Orders Response:", {
      status: ordersB2BResponse.status,
      count: ordersB2B.length,
      sample: ordersB2B.slice(0, 2)
    });

    // Fetch B2C orders từ tất cả dealers (sau khi đã có danh sách dealers)
    let ordersB2C = [];
    if (dealers.length > 0) {
      try {
        // Fetch B2C orders từ từng dealer (giới hạn 10 dealers đầu tiên để tối ưu performance)
        const dealerIds = dealers.slice(0, 10).map(d => d.dealerId || d.id).filter(Boolean);
        const b2cPromises = dealerIds.map(dealerId => 
          apiConstSaleService.get(`${BASE_ORDER_B2C_URL}/dealer/${dealerId}`)
            .then(res => {
              const data = res.data?.data || res.data;
              return Array.isArray(data) ? data : [];
            })
            .catch(() => [])
        );
        
        const b2cResults = await Promise.allSettled(b2cPromises);
        ordersB2C = b2cResults
          .filter(result => result.status === 'fulfilled')
          .flatMap(result => result.value || []);
      } catch (err) {
        console.warn("Error fetching B2C orders from dealers:", err);
      }
    }
    
    console.log("🛍️ B2C Orders Response:", {
      count: ordersB2C.length,
      sample: ordersB2C.slice(0, 2)
    });

    // Gộp tất cả orders
    const allOrders = [...ordersB2B, ...ordersB2C];

    // Lọc orders theo date range
    const filteredOrders = allOrders.filter(order => {
      if (!order.orderDate) return false;
      
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return false;
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return orderDate >= start && orderDate <= end;
    });

    // Tính tổng doanh thu từ orders đã xác nhận/giao
    const totalRevenue = filteredOrders
      .filter(order => {
        const status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
        const statusStr = typeof status === 'object' ? status?.name : status;
        const upperStatus = String(statusStr || '').toUpperCase();
        return ['CONFIRMED', 'DELIVERED', 'APPROVED'].includes(upperStatus);
      })
      .reduce((total, order) => {
        return total + (parseFloat(order.totalAmount) || 0);
      }, 0);

    // Xử lý công nợ đại lý
    const dealerDebt = dealerDebtResponse.status === 'fulfilled'
      ? (dealerDebtResponse.value.data?.data || [])
      : [];

    // Tính toán doanh thu theo khu vực (tạm thời group theo dealer location nếu có)
    const revenueByRegion = calculateRevenueByRegion(filteredOrders, dealers);

    console.log("📊 Admin Dashboard Data Summary:", {
      totalDealers: dealers.length,
      dealersByStatus,
      totalCustomers: customers.length,
      totalOrdersB2B: ordersB2B.length,
      totalOrdersB2C: ordersB2C.length,
      totalOrders: allOrders.length,
      filteredOrders: filteredOrders.length,
      totalRevenue,
      dealerDebtCount: dealerDebt.length
    });

    return {
      dealers,
      dealersByStatus,
      customers,
      ordersB2B,
      ordersB2C,
      allOrders: filteredOrders,
      totalRevenue,
      dealerDebt,
      revenueByRegion,
      dateRange: { startDate, endDate }
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw error;
  }
};

/**
 * Tính doanh thu theo khu vực
 */
const calculateRevenueByRegion = (orders, dealers) => {
  const regionMap = {};
  
  orders.forEach(order => {
    const dealerId = order.dealerId;
    const dealer = dealers.find(d => d.dealerId === dealerId || d.id === dealerId);
    const region = dealer?.region || dealer?.location || dealer?.address || 'Khác';
    
    if (!regionMap[region]) {
      regionMap[region] = {
        region,
        revenue: 0,
        orderCount: 0
      };
    }
    
    const status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
    const statusStr = typeof status === 'object' ? status?.name : status;
    const upperStatus = String(statusStr || '').toUpperCase();
    
    if (['CONFIRMED', 'DELIVERED', 'APPROVED'].includes(upperStatus)) {
      regionMap[region].revenue += parseFloat(order.totalAmount) || 0;
      regionMap[region].orderCount += 1;
    }
  });
  
  return Object.values(regionMap);
};


/**
 * Staff Dashboard Service
 * Hàm constant để fetch tất cả dữ liệu cần thiết cho dashboard của staff
 */
import apiConstSaleService from "../../../../../services/apiConstSaleService";
import apiConstPaymentService from "../../../../../services/apiConstPaymentService";

const BASE_QUOTATION_URL = "/api/v1/quotations";
const BASE_ORDER_B2C_URL = "/api/v1/sales-orders/b2c";
const BASE_ORDER_B2B_URL = "/sales-orders/my-orders";
const BASE_PAYMENT_URL = "/api/v1/payments/customer";

/**
 * Hàm constant để fetch tất cả dữ liệu dashboard của staff
 * @param {string} staffId - ID của staff
 * @param {string} dealerId - ID của dealer (để lấy B2B orders)
 * @param {Object} dateRange - { startDate, endDate } (optional)
 * @returns {Promise<Object>} Object chứa tất cả dữ liệu
 */
export const fetchStaffDashboardData = async (staffId, dealerId, dateRange = null) => {
  try {
    // Tính toán date range nếu không có
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

    // Fetch tất cả dữ liệu song song
    const [quotationsResponse, ordersB2CResponse, ordersB2BResponse] = await Promise.allSettled([
      // Fetch quotations của staff
      apiConstSaleService.get(`${BASE_QUOTATION_URL}/staff/${staffId}`, {
        params: {
          dateFrom: startDate,
          dateTo: endDate
        }
      }),
      // Fetch B2C orders của dealer (sẽ filter theo createdBy sau)
      apiConstSaleService.get(`${BASE_ORDER_B2C_URL}/dealer/${dealerId}`),
      // Fetch B2B orders của dealer (sẽ filter theo createdBy sau)
      apiConstSaleService.get(`${BASE_ORDER_B2B_URL}`, {
        params: {
          page: 0,
          size: 1000
        }
      })
    ]);

    // Lấy dữ liệu từ response
    const quotations = quotationsResponse.status === 'fulfilled' 
      ? (quotationsResponse.value.data?.data || quotationsResponse.value.data || [])
      : [];
    
    const ordersB2C = ordersB2CResponse.status === 'fulfilled'
      ? (ordersB2CResponse.value.data?.data || ordersB2CResponse.value.data || [])
      : [];
    
    // B2B orders có thể là Page hoặc List
    let ordersB2B = [];
    if (ordersB2BResponse.status === 'fulfilled') {
      const b2bData = ordersB2BResponse.value.data?.data || ordersB2BResponse.value.data;
      if (b2bData?.content) {
        ordersB2B = b2bData.content;
      } else if (Array.isArray(b2bData)) {
        ordersB2B = b2bData;
      }
    }
    
    // Gộp B2C và B2B orders
    const allOrders = [...ordersB2C, ...ordersB2B];
    
    // Fetch payment records để lấy orders mà staff đã thanh toán
    // Chỉ fetch cho orders hôm nay để tối ưu performance
    let paidOrderIds = new Set();
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Lọc orders hôm nay
      const todayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      
      // Lấy payment history cho orders hôm nay
      const paymentPromises = todayOrders.slice(0, 20).map(async (order) => {
        try {
          const paymentHistory = await apiConstPaymentService.get(
            `${BASE_PAYMENT_URL}/orders/${order.orderId || order.id}/history`
          );
          const transactions = paymentHistory.data?.data || paymentHistory.data || [];
          // Kiểm tra xem có transaction nào được xác nhận bởi staff này hôm nay không
          const hasMyTransactionToday = transactions.some(transaction => {
            const transactionDate = new Date(transaction.transactionDate || transaction.createdAt);
            transactionDate.setHours(0, 0, 0, 0);
            const isToday = transactionDate.getTime() === today.getTime();
            
            // Transaction có thể có processedBy, confirmedBy, hoặc staffId
            // Hoặc có thể check status = "SUCCESS" và transactionDate hôm nay
            const processedBy = transaction.processedBy || transaction.confirmedBy || transaction.staffId;
            const isMyTransaction = processedBy === staffId || processedBy?.toString() === staffId?.toString();
            
            // Nếu transaction hôm nay và status SUCCESS, coi như staff đã thanh toán
            return isToday && (isMyTransaction || transaction.status === "SUCCESS");
          });
          if (hasMyTransactionToday) {
            return order.orderId || order.id;
          }
        } catch (err) {
          // Ignore errors for individual orders
        }
        return null;
      });
      
      const paidIds = await Promise.allSettled(paymentPromises);
      paidIds.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          paidOrderIds.add(result.value);
        }
      });
    } catch (err) {
      console.warn("Error fetching payment records:", err);
    }
    
    // Lọc orders theo date range - HIỂN THỊ TẤT CẢ ORDERS CỦA DEALER (không filter theo staffId)
    let filteredOrders = allOrders.filter(order => {
      if (!order.orderDate) {
        console.warn("Order missing orderDate:", order.orderId || order.id);
        return false;
      }
      
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) {
        console.warn("Invalid orderDate:", order.orderDate, "Order:", order.orderId || order.id);
        return false;
      }
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      // Chỉ kiểm tra date range - hiển thị tất cả orders của dealer
      return orderDate >= start && orderDate <= end;
    });
    
    console.log("📊 Staff Dashboard - Filtered Orders:", {
      totalOrders: allOrders.length,
      filteredOrders: filteredOrders.length,
      dateRange: { startDate, endDate }
    });

    // Tính toán dữ liệu tháng trước để so sánh
    const prevMonthStart = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() - 1));
    const prevMonthEnd = new Date(new Date(endDate).setMonth(new Date(endDate).getMonth() - 1));
    
    const [prevQuotationsResponse, prevOrdersB2CResponse, prevOrdersB2BResponse] = await Promise.allSettled([
      apiConstSaleService.get(`${BASE_QUOTATION_URL}/staff/${staffId}`, {
        params: {
          dateFrom: prevMonthStart.toISOString().split('T')[0],
          dateTo: prevMonthEnd.toISOString().split('T')[0]
        }
      }),
      apiConstSaleService.get(`${BASE_ORDER_B2C_URL}/dealer/${dealerId}`),
      apiConstSaleService.get(`${BASE_ORDER_B2B_URL}`, {
        params: {
          page: 0,
          size: 1000
        }
      })
    ]);

    const prevQuotations = prevQuotationsResponse.status === 'fulfilled'
      ? (prevQuotationsResponse.value.data?.data || prevQuotationsResponse.value.data || [])
      : [];
    
    const prevOrdersB2C = prevOrdersB2CResponse.status === 'fulfilled'
      ? (prevOrdersB2CResponse.value.data?.data || prevOrdersB2CResponse.value.data || [])
      : [];
    
    let prevOrdersB2B = [];
    if (prevOrdersB2BResponse.status === 'fulfilled') {
      const prevB2bData = prevOrdersB2BResponse.value.data?.data || prevOrdersB2BResponse.value.data;
      if (prevB2bData?.content) {
        prevOrdersB2B = prevB2bData.content;
      } else if (Array.isArray(prevB2bData)) {
        prevOrdersB2B = prevB2bData;
      }
    }
    
    const prevAllOrders = [...prevOrdersB2C, ...prevOrdersB2B];
    const prevFilteredOrders = prevAllOrders.filter(order => {
      if (!order.orderDate) return false;
      
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return false;
      
      const start = new Date(prevMonthStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(prevMonthEnd);
      end.setHours(23, 59, 59, 999);
      
      // Chỉ kiểm tra date range - hiển thị tất cả orders của dealer
      return orderDate >= start && orderDate <= end;
    });

    return {
      quotations,
      orders: filteredOrders,
      prevQuotations,
      prevOrders: prevFilteredOrders,
      dateRange: { startDate, endDate }
    };
  } catch (error) {
    console.error("Error fetching staff dashboard data:", error);
    throw error;
  }
};


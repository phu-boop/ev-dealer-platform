/**
 * Utility functions để tính toán các số liệu thống kê
 */

/**
 * Format số tiền thành VNĐ
 */
export const formatCurrency = (amount) => {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Helper function để lấy status string từ order (có thể là string hoặc object)
 */
const getOrderStatus = (order) => {
  // B2B orders: orderStatus
  let b2bStatus = order.orderStatus;
  if (b2bStatus && typeof b2bStatus === 'object') {
    b2bStatus = b2bStatus.name || b2bStatus.toString();
  }
  if (b2bStatus) {
    b2bStatus = String(b2bStatus).toUpperCase().trim();
  }
  
  // B2C orders: orderStatusB2C hoặc order_status_b2c
  let b2cStatus = order.orderStatusB2C || order.order_status_b2c;
  if (b2cStatus && typeof b2cStatus === 'object') {
    b2cStatus = b2cStatus.name || b2cStatus.toString();
  }
  if (b2cStatus) {
    b2cStatus = String(b2cStatus).toUpperCase().trim();
  }
  
  return { b2bStatus, b2cStatus };
};

/**
 * Tính tổng doanh thu từ danh sách orders
 * Bao gồm cả B2B và B2C
 */
export const calculateTotalRevenue = (orders) => {
  if (!orders || orders.length === 0) {
    console.log("💰 calculateTotalRevenue: No orders provided");
    return 0;
  }
  
  console.log("💰 calculateTotalRevenue: Processing", orders.length, "orders");
  
  const validOrders = orders.filter(order => {
    const { b2bStatus, b2cStatus } = getOrderStatus(order);
    
    // B2B orders: orderStatus
    const isB2BValid = b2bStatus === "CONFIRMED" || 
                       b2bStatus === "DELIVERED";
    
    // B2C orders: orderStatusB2C hoặc order_status_b2c
    const isB2CValid = b2cStatus === "CONFIRMED" || 
                       b2cStatus === "DELIVERED" ||
                       b2cStatus === "APPROVED";
    
    const isValid = isB2BValid || isB2CValid;
    
    if (!isValid) {
      console.log("❌ Order filtered out:", {
        orderId: order.orderId || order.id,
        b2bStatus,
        b2cStatus,
        isB2BValid,
        isB2CValid
      });
    }
    
    return isValid;
  });
  
  console.log("💰 Valid orders for revenue:", validOrders.length, "out of", orders.length);
  
  const total = validOrders.reduce((total, order) => {
    const amount = parseFloat(order.totalAmount) || 0;
    return total + amount;
  }, 0);
  
  console.log("💰 Total Revenue Calculated:", total);
  
  return total;
};

/**
 * Đếm số lượng orders theo trạng thái
 * Hỗ trợ cả B2B và B2C
 */
export const countOrdersByStatus = (orders) => {
  const statusCounts = {
    PENDING: 0,
    CONFIRMED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    APPROVED: 0,
    REJECTED: 0,
    IN_PRODUCTION: 0,
    IN_TRANSIT: 0,
    DISPUTED: 0,
    EDITED: 0,
  };

  if (!orders || orders.length === 0) {
    return statusCounts;
  }

  orders.forEach(order => {
    const { b2bStatus, b2cStatus } = getOrderStatus(order);
    
    // Ưu tiên B2C status, nếu không có thì dùng B2B status
    let status = b2cStatus || b2bStatus;
    
    // Nếu status là object, lấy name
    if (status && typeof status === 'object') {
      status = status.name || status.toString();
    }
    
    // Convert sang string và uppercase
    if (status) {
      status = String(status).toUpperCase().trim();
      
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        // Nếu status không khớp, log để debug
        console.warn("Unknown order status:", status, "Order:", order.orderId || order.id);
        statusCounts.PENDING++;
      }
    } else {
      // Nếu không có status, thêm vào PENDING
      statusCounts.PENDING++;
    }
  });

  return statusCounts;
};

/**
 * Đếm số lượng quotations theo trạng thái
 */
export const countQuotationsByStatus = (quotations) => {
  const statusCounts = {
    DRAFT: 0,
    SENT: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    PENDING: 0,
    COMPLETE: 0,
    EXPIRED: 0,
  };

  quotations.forEach(quotation => {
    const status = quotation.status;
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    } else {
      statusCounts.DRAFT++;
    }
  });

  return statusCounts;
};

/**
 * Tính tỷ lệ chốt đơn (Conversion Rate)
 * Conversion Rate = (Số orders từ quotations) / (Tổng số quotations đã gửi) * 100
 */
export const calculateConversionRate = (quotations, orders) => {
  // Đếm số quotations đã gửi (SENT, ACCEPTED, COMPLETE)
  const sentQuotations = quotations.filter(q => 
    q.status === "SENT" || q.status === "ACCEPTED" || q.status === "COMPLETE"
  ).length;

  // Đếm số orders được tạo từ quotations (có quotationId)
  const ordersFromQuotations = orders.filter(order => 
    order.quotationId || order.quotation?.quotationId
  ).length;

  if (sentQuotations === 0) return 0;
  
  return ((ordersFromQuotations / sentQuotations) * 100).toFixed(2);
};

/**
 * Tính phần trăm thay đổi
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return (((current - previous) / previous) * 100).toFixed(1);
};

/**
 * Lấy màu cho phần trăm thay đổi
 */
export const getChangeColor = (percentage) => {
  const num = parseFloat(percentage);
  if (num > 0) return "text-green-600";
  if (num < 0) return "text-red-600";
  return "text-gray-600";
};

/**
 * Lấy icon cho phần trăm thay đổi
 */
export const getChangeIcon = (percentage) => {
  const num = parseFloat(percentage);
  if (num > 0) return "↑";
  if (num < 0) return "↓";
  return "→";
};

/**
 * Tính doanh thu hôm nay và so sánh với hôm qua
 * @param {Array} orders - Danh sách orders
 * @returns {Object} { todayRevenue, yesterdayRevenue, growthPercentage }
 */
export const calculateTodayVsYesterday = (orders) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Lọc orders hôm nay
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  // Lọc orders hôm qua
  const yesterdayOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === yesterday.getTime();
  });

  const todayRevenue = calculateTotalRevenue(todayOrders);
  const yesterdayRevenue = calculateTotalRevenue(yesterdayOrders);
  const growthPercentage = calculatePercentageChange(todayRevenue, yesterdayRevenue);

  return {
    todayRevenue,
    yesterdayRevenue,
    growthPercentage: parseFloat(growthPercentage) || 0
  };
};


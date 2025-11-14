/**
 * Utility functions để xử lý dữ liệu cho biểu đồ
 */

/**
 * Tính doanh thu theo ngày
 */
export const calculateDailyRevenue = (orders) => {
  const dailyRevenue = {};
  
  orders.forEach(order => {
    // B2B orders: orderStatus
    const isB2BValid = order.orderStatus === "CONFIRMED" || 
                       order.orderStatus === "DELIVERED";
    
    // B2C orders: orderStatusB2C hoặc order_status_b2c
    const b2cStatus = order.orderStatusB2C || order.order_status_b2c;
    const isB2CValid = b2cStatus === "CONFIRMED" || 
                       b2cStatus === "DELIVERED" ||
                       b2cStatus === "APPROVED";
    
    if (isB2BValid || isB2CValid) {
      const date = new Date(order.orderDate);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dailyRevenue[dateKey]) {
        dailyRevenue[dateKey] = 0;
      }
      dailyRevenue[dateKey] += order.totalAmount || 0;
    }
  });

  // Sắp xếp theo ngày
  const sortedDates = Object.keys(dailyRevenue).sort();
  
  return sortedDates.map(date => ({
    date,
    label: formatDateLabel(date, 'day'),
    revenue: dailyRevenue[date]
  }));
};

/**
 * Tính doanh thu theo tuần
 */
export const calculateWeeklyRevenue = (orders) => {
  const weeklyRevenue = {};
  
  orders.forEach(order => {
    // B2B orders: orderStatus
    const isB2BValid = order.orderStatus === "CONFIRMED" || 
                       order.orderStatus === "DELIVERED";
    
    // B2C orders: orderStatusB2C hoặc order_status_b2c
    const b2cStatus = order.orderStatusB2C || order.order_status_b2c;
    const isB2CValid = b2cStatus === "CONFIRMED" || 
                       b2cStatus === "DELIVERED" ||
                       b2cStatus === "APPROVED";
    
    if (isB2BValid || isB2CValid) {
      const date = new Date(order.orderDate);
      const weekKey = getWeekKey(date);
      
      if (!weeklyRevenue[weekKey]) {
        weeklyRevenue[weekKey] = 0;
      }
      weeklyRevenue[weekKey] += order.totalAmount || 0;
    }
  });

  // Sắp xếp theo tuần
  const sortedWeeks = Object.keys(weeklyRevenue).sort();
  
  return sortedWeeks.map(weekKey => ({
    date: weekKey,
    label: formatWeekLabel(weekKey),
    revenue: weeklyRevenue[weekKey]
  }));
};

/**
 * Tính doanh thu theo tháng
 */
export const calculateMonthlyRevenue = (orders) => {
  const monthlyRevenue = {};
  
  orders.forEach(order => {
    // B2B orders: orderStatus
    const isB2BValid = order.orderStatus === "CONFIRMED" || 
                       order.orderStatus === "DELIVERED";
    
    // B2C orders: orderStatusB2C hoặc order_status_b2c
    const b2cStatus = order.orderStatusB2C || order.order_status_b2c;
    const isB2CValid = b2cStatus === "CONFIRMED" || 
                       b2cStatus === "DELIVERED" ||
                       b2cStatus === "APPROVED";
    
    if (isB2BValid || isB2CValid) {
      const date = new Date(order.orderDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += order.totalAmount || 0;
    }
  });

  // Sắp xếp theo tháng
  const sortedMonths = Object.keys(monthlyRevenue).sort();
  
  return sortedMonths.map(monthKey => ({
    date: monthKey,
    label: formatMonthLabel(monthKey),
    revenue: monthlyRevenue[monthKey]
  }));
};

/**
 * Lấy key cho tuần (YYYY-MM-DD của thứ 2 đầu tuần)
 */
const getWeekKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Lấy thứ 2 đầu tuần
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Format label cho ngày
 */
const formatDateLabel = (dateString, type) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

/**
 * Format label cho tuần
 */
const formatWeekLabel = (weekKey) => {
  const date = new Date(weekKey);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

/**
 * Format label cho tháng
 */
const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-');
  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return `${monthNames[parseInt(month) - 1]}/${year.slice(-2)}`;
};

/**
 * Lấy dữ liệu cho biểu đồ theo period type
 */
export const getChartData = (orders, periodType) => {
  switch (periodType) {
    case 'day':
      return calculateDailyRevenue(orders);
    case 'week':
      return calculateWeeklyRevenue(orders);
    case 'month':
      return calculateMonthlyRevenue(orders);
    default:
      return calculateDailyRevenue(orders);
  }
};


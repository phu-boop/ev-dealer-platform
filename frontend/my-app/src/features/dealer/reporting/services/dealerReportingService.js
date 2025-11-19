// src/features/dealer/reporting/services/dealerReportingService.js

// 1. Import đúng file service của dự án
import apiConstReportService from "../../../../services/apiConstReportService";

// --- CẤU HÌNH API ENDPOINT ---
const API_URLS = {
  // URL B2B (Hóa đơn)
  B2B_INVOICES: "/payments/api/v1/payments/dealer/3ec76f92-7d44-49f4-ada1-b47d4f55b418/invoices",
  
  // URL B2C (Đơn hàng)
  
  B2C_ORDERS: "/sales/api/v1/sales-orders/b2c/dealer/3ec76f92-7d44-49f4-ada1-b47d4f55b418", 
};

/**
 * 1. Lấy dữ liệu báo cáo Công nợ B2B (Đại lý nợ Hãng)
 */
export const getB2BDebtReport = async () => {
  try {
    // SỬA: Dùng apiConstReportService thay cho axios
    const response = await apiConstReportService.get(API_URLS.B2B_INVOICES, {
      params: { page: 0, size: 1000 } 
    });

    // Dữ liệu nằm trong response.data.content
    // (Lưu ý: apiConstReportService thường trả về response gốc, nên truy cập data.content là đúng)
    // Nếu apiConstReportService đã .data rồi, thì chỉ cần response.content. Bạn cứ để code này, nếu lỗi mình sửa sau.
    const invoices = response.data?.content || [];

    // Tính toán tổng hợp
    const summary = invoices.reduce(
      (acc, item) => {
        acc.totalDebt += item.totalAmount || 0;     
        acc.totalPaid += item.amountPaid || 0;      
        acc.totalRemaining += item.remainingAmount || 0; 
        return acc;
      },
      { totalDebt: 0, totalPaid: 0, totalRemaining: 0 }
    );

    return { summary, details: invoices };
  } catch (error) {
    console.error("Lỗi lấy báo cáo B2B:", error);
    return { summary: { totalDebt: 0, totalPaid: 0, totalRemaining: 0 }, details: [] };
  }
};

/**
 * 2. Lấy dữ liệu báo cáo Công nợ B2C (Khách hàng nợ Đại lý)
 */
export const getB2CDebtReport = async () => {
  try {
    // SỬA: Dùng apiConstReportService thay cho axios
    const response = await apiConstReportService.get(API_URLS.B2C_ORDERS);

    // Dữ liệu nằm trong response.data.data
    const orders = response.data?.data || [];

    // Tính toán tổng hợp
    const summary = orders.reduce(
      (acc, item) => {
        const total = item.totalAmount || 0;
        const paid = item.downPayment || 0; 
        const remaining = total - paid;

        acc.totalReceivable += total; 
        acc.totalCollected += paid;   
        acc.totalOutstanding += remaining > 0 ? remaining : 0; 
        return acc;
      },
      { totalReceivable: 0, totalCollected: 0, totalOutstanding: 0 }
    );

    return { summary, details: orders };
  } catch (error) {
    console.error("Lỗi lấy báo cáo B2C:", error);
    return { summary: { totalReceivable: 0, totalCollected: 0, totalOutstanding: 0 }, details: [] };
  }
};
// File: src/features/dealer/reporting/services/dealerReportingService.js

import apiConstPaymentService from "../../../../services/apiConstPaymentService";
import apiConstSaleService from "../../../../services/apiConstSaleService";

// --- ID CỨNG (Lấy từ ảnh Hóa đơn thành công của bạn) ---
const HARD_DEALER_ID = "3ec76f92-7d44-49f4-ada1-b47d4f55b418";

const getApiUrls = () => {
  return {
    // URL B2B (Hóa đơn)
    // Lưu ý: Tôi dùng đường dẫn tương đối, hy vọng apiConstPaymentService đã có base URL đúng
    B2B_INVOICES: `/api/v1/payments/dealer/${HARD_DEALER_ID}/invoices`,
    
    // URL B2C (Đơn hàng)
    B2C_ORDERS: `/api/v1/sales-orders/b2c/dealer/${HARD_DEALER_ID}`,
  };
};

export const getB2BDebtReport = async () => {
  try {
    const urls = getApiUrls();
    console.log("🚀 Đang gọi API B2B tới:", urls.B2B_INVOICES); // Log để kiểm tra

    const response = await apiConstPaymentService.get(urls.B2B_INVOICES, {
      params: { page: 0, size: 1000 } 
    });

    console.log("✅ API B2B Trả về:", response); // Log kết quả

    const invoices = response.data?.content || [];
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
    console.error("❌ Lỗi B2B:", error);
    return { summary: { totalDebt: 0, totalPaid: 0, totalRemaining: 0 }, details: [] };
  }
};

export const getB2CDebtReport = async () => {
  try {
    const urls = getApiUrls();
    console.log("🚀 Đang gọi API B2C tới:", urls.B2C_ORDERS);

    const response = await apiConstSaleService.get(urls.B2C_ORDERS);
    
    console.log("✅ API B2C Trả về:", response);

    const orders = response.data?.data || [];
    const summary = orders.reduce(
      (acc, item) => {
        const total = Number(item.totalAmount) || 0;
        const paid = Number(item.downPayment) || 0;
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
    console.error("❌ Lỗi B2C:", error);
    return { summary: { totalReceivable: 0, totalCollected: 0, totalOutstanding: 0 }, details: [] };
  }
};
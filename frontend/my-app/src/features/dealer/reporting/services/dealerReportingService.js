// File: src/features/dealer/reporting/services/dealerReportingService.js

import apiConstPaymentService from "../../../../services/apiConstPaymentService";
import apiConstSaleService from "../../../../services/apiConstSaleService";

// --- HÀM LẤY ID TỰ ĐỘNG TỪ LOCAL STORAGE ---
const getDealerId = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return "";
    const user = JSON.parse(userStr);
    return user.dealerId || user.id || ""; 
  } catch (e) {
    return "";
  }
};

const getApiUrls = () => {
  const dealerId = getDealerId();
  // Trả về đường dẫn chuẩn (đã bỏ prefix thừa)
  return {
    B2B_INVOICES: `/api/v1/payments/dealer/${dealerId}/invoices`,
    B2C_ORDERS: `/api/v1/sales-orders/b2c/dealer/${dealerId}`,
  };
};

export const getB2BDebtReport = async () => {
  try {
    const urls = getApiUrls();
    // Kiểm tra ID hợp lệ
    if (urls.B2B_INVOICES.includes("/dealer//") || urls.B2B_INVOICES.endsWith("/")) {
       return { summary: { totalDebt: 0, totalPaid: 0, totalRemaining: 0 }, details: [] };
    }

    const response = await apiConstPaymentService.get(urls.B2B_INVOICES, {
      params: { page: 0, size: 1000 } 
    });

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
    console.error("Lỗi B2B:", error);
    return { summary: { totalDebt: 0, totalPaid: 0, totalRemaining: 0 }, details: [] };
  }
};

export const getB2CDebtReport = async () => {
  try {
    const urls = getApiUrls();
    if (urls.B2C_ORDERS.includes("/dealer//") || urls.B2C_ORDERS.endsWith("/")) {
       return { summary: { totalReceivable: 0, totalCollected: 0, totalOutstanding: 0 }, details: [] };
    }

    const response = await apiConstSaleService.get(urls.B2C_ORDERS);
    const orders = response.data?.data || [];
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
    console.error("Lỗi B2C:", error);
    return { summary: { totalReceivable: 0, totalCollected: 0, totalOutstanding: 0 }, details: [] };
  }
};
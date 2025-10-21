import apiConstInventoryService from "../../../../services/apiConstInventoryService.js";

/**
 * Lấy danh sách tồn kho phân trang và có bộ lọc.
 * @param {object} params - { page, size, sort, search, dealerId, status }
 */
export const getAllInventory = (params) => {
  return apiConstInventoryService.get("/inventory", { params });
};

/**
 * Lấy trạng thái tồn kho chi tiết cho một phiên bản.
 * @param {number|string} variantId
 */
export const getInventoryStatus = (variantId) => {
  return apiConstInventoryService.get(`/inventory/${variantId}`);
};

/**
 * Thực hiện một giao dịch kho (nhập, xuất, điều chuyển...).
 * @param {object} transactionData - Dữ liệu giao dịch.
 */
export const executeTransaction = (transactionData) => {
  return apiConstInventoryService.post(
    "/inventory/transactions",
    transactionData
  );
};

/**
 * Cập nhật ngưỡng đặt hàng lại cho kho trung tâm.
 * @param {object} data - { variantId, reorderLevel }
 */
export const updateCentralReorderLevel = (data) => {
  return apiConstInventoryService.put(
    "/inventory/central-stock/reorder-level",
    data
  );
};

/**
 * Lấy lịch sử giao dịch kho phân trang và có bộ lọc.
 * @param {object} params - { page, size, sort, startDate, endDate }
 */
export const getTransactionHistory = (params) => {
  return apiConstInventoryService.get("/inventory/transactions", { params });
};

/**
 * Lấy danh sách các cảnh báo tồn kho đang hoạt động.
 */
export const getActiveAlerts = () => {
  return apiConstInventoryService.get("/inventory/alerts");
};

/**
 * Xuất báo cáo tồn kho.
 * @param {object} params - { startDate, endDate, format }
 */
export const exportInventoryReport = (params) => {
  return apiConstInventoryService.get("/inventory/report/export", {
    params,
    responseType: "blob", // Rất quan trọng để xử lý file download
  });
};

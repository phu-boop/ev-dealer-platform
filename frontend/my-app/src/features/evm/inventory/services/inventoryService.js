import apiConstInventoryService from "../../../../services/apiConstInventoryService.js";

// --- Định nghĩa các hàm gọi API cụ thể ---

/**
 * Lấy dữ liệu tồn kho phân trang, có hỗ trợ lọc và tìm kiếm.
 * @param {object} params - Các tham số như { page, size, search, dealerId, color, versionName }
 */
export const getInventory = (params) => {
  return apiConstInventoryService.get("", { params });
};

/**
 * Lấy trạng thái tồn kho chi tiết cho một phiên bản xe cụ thể.
 * @param {number | string} variantId - ID của phiên bản xe.
 */
export const getInventoryForVariant = (variantId) => {
  return apiConstInventoryService.get(`/${variantId}`);
};

/**
 * Thực hiện một giao dịch kho (nhập, xuất, điều chuyển...).
 * @param {object} transactionData - Dữ liệu của giao dịch.
 */
export const executeTransaction = (transactionData) => {
  return apiConstInventoryService.post("/transactions", transactionData);
};

/**
 * Cập nhật ngưỡng cảnh báo cho kho trung tâm.
 * @param {object} data - { variantId, reorderLevel }
 */
export const updateCentralReorderLevel = (data) => {
  return apiConstInventoryService.put("/central-stock/reorder-level", data);
};

/**
 * Cập nhật ngưỡng cảnh báo cho kho của đại lý.
 * @param {object} data - { variantId, reorderLevel }
 */
export const updateDealerReorderLevel = (data) => {
  return apiConstInventoryService.put("/dealer-stock/reorder-level", data);
};

/**
 * Lấy lịch sử giao dịch kho, có hỗ trợ phân trang và lọc theo ngày.
 * @param {object} params - Các tham số như { page, size, startDate, endDate }
 */
export const getTransactionHistory = (params) => {
  return apiConstInventoryService.get("/transactions", { params });
};

/**
 * Lấy danh sách các cảnh báo tồn kho đang hoạt động.
 */
export const getActiveAlerts = () => {
  return apiConstInventoryService.get("/alerts");
};

/**
 * Xuất báo cáo tồn kho ra file.
 * @param {object} params - Các tham số như { startDate, endDate, format }
 */
export const exportInventoryReport = (params) => {
  return apiConstInventoryService.get("/report/export", {
    params,
    responseType: "blob", // Yêu cầu axios trả về dữ liệu dạng file (blob)
  });
};

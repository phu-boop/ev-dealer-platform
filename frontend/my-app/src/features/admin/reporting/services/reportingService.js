import apiConstReportService from "../../../../services/apiConstReportService"; // Hoặc đường dẫn đúng đến file axios của bạn

/**
 * Lấy Báo cáo Doanh số (Sales Summary).
 * Tương ứng với: GET /reports/sales
 *
 * @param {object} filters - Đối tượng chứa các filter (region, dealershipId, modelId, variantId)
 */
export const getSalesSummary = (filters) => {
  return apiConstReportService.get("/reports/sales", {
    params: filters,
  });
};

/**
 * Lấy Báo cáo Tồn kho & Tốc độ tiêu thụ (Inventory Velocity).
 * Tương ứng với: GET /reports/inventory-velocity
 *
 * @param {object} filters - Đối tượng chứa các filter (region, modelId, variantId)
 */
export const getInventoryVelocity = (filters) => {
  return apiConstReportService.get("/reports/inventory-velocity", {
    params: filters,
  });
};

/**
 * LVIC (Nếu bạn vẫn muốn gọi API tồn kho riêng)
 * Tương ứng với: GET /reports/inventory
 *
 */
export const getInventorySummary = (filters) => {
  return apiConstReportService.get("/reports/inventory", {
    params: filters,
  });
};

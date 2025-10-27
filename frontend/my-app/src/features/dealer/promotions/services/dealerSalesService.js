import apiConstSaleService from "../../../../services/apiConstSaleService";
import apiConstVehicleService from "../../../../services/apiConstVehicleService";
import apiConstDealerService from "../../../../services/apiConstDealerService";

// ----- API gọi đến vehicle-service -----

/**
 * Lấy danh sách tóm tắt tất cả các Mẫu xe (để hiển thị cho đại lý).
 */
export const getB2BCatalogModels = () => {
  // Đại lý gọi API "getModels" (lấy danh sách tóm tắt)
  return apiConstVehicleService.get("/vehicle-catalog/models");
};

/**
 * Lấy chi tiết một Mẫu xe (bao gồm các phiên bản/variant)
 */
export const getB2BModelDetails = (modelId) => {
  return apiConstVehicleService.get(`/vehicle-catalog/models/${modelId}`);
};

// ----- API gọi đến sales-service -----

/**
 * Gửi đơn đặt hàng B2B (Đại lý đặt hãng)
 * @param {object} orderData - Cấu trúc: { items: [{ variantId: 1, quantity: 10 }, ...] }
 */
export const createB2BOrder = (orderData) => {
  return apiConstSaleService.post("/sales-orders/b2b", orderData);
};

/**
 * Lấy lịch sử đơn hàng B2B của chính đại lý đó
 */
export const getMyB2BOrders = (params) => {
  // Giả sử có một endpoint an toàn cho đại lý xem đơn của chính họ
  return apiConstSaleService.get("/sales-orders/my-orders", { params });
};

/**
 * Đại lý xác nhận đã nhận hàng
 */
export const confirmDelivery = (orderId) => {
  return apiConstSaleService.put(`/sales-orders/${orderId}/deliver`);
};

/**
 * Lấy danh sách rút gọn của tất cả các đại lý (chỉ cần ID và Tên).
 */
export const getAllDealersList = () => {
  return apiConstDealerService.get("/api/dealers/list-all");
};

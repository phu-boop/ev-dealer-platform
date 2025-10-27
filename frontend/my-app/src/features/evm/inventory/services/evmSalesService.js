import apiConstSaleService from "../../../../services/apiConstSaleService";

/**
 * Lấy danh sách tất cả đơn hàng B2B (cho EVM) có lọc theo trạng thái
 * @param {object} params - ví dụ: { status: 'PENDING', page: 0, size: 10 }
 */
export const getB2BOrders = (params) => {
  return apiConstSaleService.get("/sales-orders/b2b", { params });
};

/**
 * EVM Staff duyệt một đơn hàng
 * @param {string} orderId - UUID của đơn hàng
 */
export const approveB2BOrder = (orderId) => {
  return apiConstSaleService.put(`/sales-orders/${orderId}/approve`);
};

/**
 * EVM Staff giao hàng (gửi kèm danh sách VIN)
 * @param {string} orderId - UUID của đơn hàng
 * @param {object} shipmentData - Dữ liệu ShipmentRequestDto (chứa danh sách VIN)
 */
export const shipB2BOrder = (orderId, shipmentData) => {
  return apiConstSaleService.put(`/sales-orders/${orderId}/ship`, shipmentData);
};

/**
 * TẠO MỘT ĐƠN HÀNG B2B MỚI (Dùng cho cả Đại lý "Kéo" và EVM "Đẩy")
 * @param {object} orderData - Dữ liệu của CreateB2BOrderRequest
 */
export const createB2BOrder = (orderData) => {
  return apiConstSaleService.post("/sales-orders/b2b", orderData);
};

// /**
//  * Tạo một yêu cầu điều chuyển xe mới (chờ duyệt).
//  * @param {object} requestData - { variantId, quantity, toDealerId, notes, requesterEmail }
//  */
// export const createTransferRequest = (requestData) => {
//   // Gọi đến endpoint mới bạn vừa tạo
//   return apiConstInventoryService.post(
//     "/inventory/transfer-requests",
//     requestData
//   );
// };

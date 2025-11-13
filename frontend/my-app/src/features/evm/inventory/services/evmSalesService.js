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
 * TẠO MỘT ĐƠN HÀNG B2B MỚI (Dùng cho Đại lý)
 * @param {object} orderData - Dữ liệu của CreateB2BOrderRequest
 */
export const createB2BOrder = (orderData) => {
  return apiConstSaleService.post("/sales-orders/b2b", orderData);
};

// Hàm cho Staff/Admin đặt hộ
export const createB2BOrderByStaff = (payload) => {
  return apiConstSaleService.post("/sales-orders/b2b/staff-placement", payload);
};

/**
 * Hủy đơn hàng bởi Staff/Admin
 * @param {string} orderId
 */
export const cancelOrderByStaff = (orderId) => {
  return apiConstSaleService.put(`/sales-orders/${orderId}/cancel-by-staff`);
};

/**
 * Xóa một đơn hàng (chỉ khi CANCELLED)
 * @param {string} orderId - UUID của đơn hàng
 */
export const deleteOrder = (orderId) => {
  return apiConstSaleService.delete(`/sales-orders/${orderId}`);
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

// ======================================================
// === CÁC HÀM MỚI CHO THÔNG BÁO & XỬ LÝ KHIẾU NẠI ===
// ======================================================

/**
 * [Staff] Lấy danh sách thông báo đã lưu (có phân trang)
 * @param {object} params - ví dụ: { page: 0, size: 10 }
 */
export const getStaffNotifications = (params) => {
  return apiConstSaleService.get("/notifications/staff", { params });
};

/**
 * [Staff] Lấy số lượng thông báo chưa đọc
 */
export const getUnreadNotificationCount = () => {
  return apiConstSaleService.get("/notifications/staff/unread-count");
};

/**
 * [Staff] Đánh dấu một thông báo là đã đọc
 * @param {string} notificationId - UUID của thông báo
 */
export const markNotificationAsRead = (notificationId) => {
  return apiConstSaleService.put(`/notifications/${notificationId}/read`);
};

/**
 * [Staff] Giải quyết một đơn hàng đang bị khiếu nại (DISPUTED)
 * @param {string} orderId - UUID của đơn hàng
 * @param {object} payload - { newStatus: "IN_TRANSIT" | "DELIVERED", notes: "..." }
 */
export const resolveOrderDispute = (orderId, payload) => {
  return apiConstSaleService.put(
    `/sales-orders/${orderId}/resolve-dispute`,
    payload
  );
};

import apiConstSaleService from "../../../../services/apiConstSaleService";

/**
 * Lấy danh sách tất cả đơn hàng B2B (cho EVM) có lọc theo trạng thái
 * @param {object} params - ví dụ: { status: 'PENDING', page: 0, size: 10 }
 */
export const getB2BOrders = (params) => {
<<<<<<< HEAD
  return apiConstSaleService.get("/api/v1/sales-orders/b2b", { params });
=======
  return apiConstSaleService.get("/sales-orders/b2b", { params });
>>>>>>> newrepo/main
};

/**
 * EVM Staff duyệt một đơn hàng
 * @param {string} orderId - UUID của đơn hàng
 */
export const approveB2BOrder = (orderId) => {
<<<<<<< HEAD
  return apiConstSaleService.put(`/api/v1/sales-orders/${orderId}/approve`);
=======
  return apiConstSaleService.put(`/sales-orders/${orderId}/approve`);
>>>>>>> newrepo/main
};

/**
 * EVM Staff giao hàng (gửi kèm danh sách VIN)
 * @param {string} orderId - UUID của đơn hàng
 * @param {object} shipmentData - Dữ liệu ShipmentRequestDto (chứa danh sách VIN)
 */
export const shipB2BOrder = (orderId, shipmentData) => {
<<<<<<< HEAD
  return apiConstSaleService.put(`/api/v1/sales-orders/${orderId}/ship`, shipmentData);
=======
  return apiConstSaleService.put(`/sales-orders/${orderId}/ship`, shipmentData);
>>>>>>> newrepo/main
};

/**
 * TẠO MỘT ĐƠN HÀNG B2B MỚI (Dùng cho Đại lý)
 * @param {object} orderData - Dữ liệu của CreateB2BOrderRequest
 */
export const createB2BOrder = (orderData) => {
<<<<<<< HEAD
  return apiConstSaleService.post("/api/v1/sales-orders/b2b", orderData);
=======
  return apiConstSaleService.post("/sales-orders/b2b", orderData);
>>>>>>> newrepo/main
};

// Hàm cho Staff/Admin đặt hộ
export const createB2BOrderByStaff = (payload) => {
<<<<<<< HEAD
  return apiConstSaleService.post("/api/v1/sales-orders/b2b/staff-placement", payload);
=======
  return apiConstSaleService.post("/sales-orders/b2b/staff-placement", payload);
>>>>>>> newrepo/main
};

/**
 * Hủy đơn hàng bởi Staff/Admin
 * @param {string} orderId
 */
export const cancelOrderByStaff = (orderId) => {
<<<<<<< HEAD
  return apiConstSaleService.put(`/api/v1/sales-orders/${orderId}/cancel-by-staff`);
=======
  return apiConstSaleService.put(`/sales-orders/${orderId}/cancel-by-staff`);
>>>>>>> newrepo/main
};

/**
 * Xóa một đơn hàng (chỉ khi CANCELLED)
 * @param {string} orderId - UUID của đơn hàng
 */
export const deleteOrder = (orderId) => {
<<<<<<< HEAD
  return apiConstSaleService.delete(`/api/v1/sales-orders/${orderId}`);
=======
  return apiConstSaleService.delete(`/sales-orders/${orderId}`);
>>>>>>> newrepo/main
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

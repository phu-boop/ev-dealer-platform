import apiConstSaleService from "../../../../services/apiConstSaleService";

// Định nghĩa các hằng số API (Nếu bạn chưa có)
// Bạn có thể chuyển chúng vào apiConstSaleService.js nếu muốn
const API_URL = {
  QUOTATIONS: "/quotations",
  GET_BY_DEALER: (dealerId) => `/quotations/dealer/${dealerId}`,
  GET_BY_ID: (id) => `/quotations/${id}`,
  UPDATE_STATUS: (id) => `/quotations/${id}/status`,
};

/**
 * Lấy danh sách báo giá cho Dealer (Manager)
 * (Backend: getQuotationsForDealer)
 * @param {string} dealerId - UUID của đại lý
 * @param {string} status - Trạng thái (PENDING, DRAFT, v.v.)
 * @returns {Promise<Array>} Danh sách báo giá
 */
export const getQuotationsByDealer = (dealerId, status = "") => {
  const params = {};
  if (status) {
    params.status = status;
  }

  return apiConstSaleService.get(API_URL.GET_BY_DEALER(dealerId), { params });
};

/**
 * API MỚI: Lấy báo giá của nhân viên đang đăng nhập
 */
export const getMyQuotations = (staffId, status = "") => {
  const params = {};
  if (status) {
    params.status = status;
  }
  return apiConstSaleService.get("/quotations/my", {
    params,
    headers: {
      "X-Staff-Id": staffId, // Gửi Staff ID để backend biết "my" là ai
    },
  });
};

/**
 * Tạo báo giá mới
 * (Backend: createQuotation)
 * @param {object} data - Dữ liệu QuotationRequestDTO
 * @param {string} staffId - UUID của nhân viên (từ context)
 * @param {string} dealerId - UUID của đại lý (từ context)
 * @returns {Promise<object>} Báo giá đã tạo
 */
export const createQuotation = (data, staffId, dealerId) => {
  return apiConstSaleService.post(API_URL.QUOTATIONS, data, {
    headers: {
      "X-Staff-Id": staffId,
      "X-Dealer-Id": dealerId,
    },
  });
};

/**
 * Cập nhật/Chỉnh sửa báo giá
 * (Backend: updateQuotation)
 * @param {string} id - UUID của báo giá
 * @param {object} data - Dữ liệu QuotationRequestDTO
 * @param {string} staffId - UUID của nhân viên (từ context)
 * @param {string} dealerId - UUID của đại lý (từ context)
 * @returns {Promise<object>} Báo giá đã cập nhật
 */
export const updateQuotation = (id, data, staffId, dealerId, role) => {
  return apiConstSaleService.put(API_URL.GET_BY_ID(id), data, {
    headers: {
      "X-Staff-Id": staffId,
      "X-Dealer-Id": dealerId,
      "X-User-Role": role,
    },
  });
};

/**
 * Duyệt/Từ chối báo giá
 * (Backend: updateQuotationStatus)
 * @param {string} id - UUID của báo giá
 * @param {string} status - "APPROVED" hoặc "REJECTED"
 * @returns {Promise<object>} Báo giá đã cập nhật
 */
export const updateQuotationStatus = (id, status, role) => {
  const data = { status };
  return apiConstSaleService.put(API_URL.UPDATE_STATUS(id), data, {
    headers: {
      "X-User-Role": role,
    },
  });
};

/**
 * Lấy chi tiết 1 báo giá
 * (Backend: chưa tạo, nhưng frontend sẽ cần)
 * @param {string} id - UUID của báo giá
 * @returns {Promise<object>}
 */
export const getQuotationById = (id) => {
  return apiConstSaleService.get(API_URL.GET_BY_ID(id));
};

/**
 * Lấy tất cả khuyến mãi đang ACTIVE cho đại lý hiện tại
 * @param {string} dealerId - UUID của đại lý (từ context)
 * @returns {Promise<Array>} Danh sách khuyến mãi
 */
export const getActiveDealerPromotions = (dealerId, modelId = null) => {
  const params = {};
  if (modelId) {
    params.modelId = modelId; // Thêm modelId vào query params
  }

  return apiConstSaleService.get("/promotions/dealer/active", {
    params, // Gửi params (ví dụ: ?modelId=3)
    headers: {
      "X-Dealer-Id": dealerId,
    },
  });
};

/**
 * Lấy thông tin cơ bản của xe (price, modelId) từ backend
 * @param {number} variantId
 * @returns {Promise<object>} { variantId, price, modelId }
 */
export const getVehicleInfo = (variantId) => {
  // URL: http://localhost:8080/sales/quotations/vehicle-info/4
  return apiConstSaleService.get(`/quotations/vehicle-info/${variantId}`);
};

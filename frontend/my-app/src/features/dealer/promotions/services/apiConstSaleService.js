// features/customer/promotions/services/customerPromotionService.js
import apiConstSaleService from '../../../../services/apiConstSaleService';

export const customerPromotionService = {
  // Chỉ lấy khuyến mãi đang hoạt động
  getActivePromotions: () => apiConstSaleService.get('/promotions/status/ACTIVE'),
  
  // Lấy tất cả khuyến mãi (nhưng chỉ hiển thị ACTIVE và UPCOMING)
  getAllPromotions: () => apiConstSaleService.get('/promotions'),
  
  // Lấy chi tiết 1 khuyến mãi
  getPromotionById: (id) => apiConstSaleService.get(`/promotions/${id}`),
  
  // Lọc theo trạng thái
  getPromotionsByStatus: (status) => apiConstSaleService.get(`/promotions/status/${status}`),
};

export default customerPromotionService;
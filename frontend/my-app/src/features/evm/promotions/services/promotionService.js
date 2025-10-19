import apiConstSaleService from "../../../../services/apiConstSaleService.js";

// export const promotionService = {
//   getAll: () => apiConstSaleService.get('/promotions'),
//   getById: (id) => apiConstSaleService.get(`/promotions/${id}`),
//   create: (data) => apiConstSaleService.post('/promotions', data),
//   update: (id, data) => apiConstSaleService.put(`/promotions/${id}`, data),
//   delete: (id) => apiConstSaleService.delete(`/promotions/${id}`),
//   getByStatus: (status) => apiConstSaleService.get(`/promotions/status/${status}`)
// };

// export default promotionService;

export const promotionService = {
  getAll: () => apiConstSaleService.get("/promotions"),
  getById: (id) => apiConstSaleService.get(`/promotions/${id}`),

  create: async (data, createdBy = "staff") => {
    try {
      const response = await apiConstSaleService.post("/promotions", data);

      // Gửi thông báo cho admin
      if (response.data) {
        await notificationService.sendPromotionNotification(
          response.data,
          createdBy
        );
      }

      return response;
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw error;
    }
  },

  update: (id, data) => apiConstSaleService.put(`/promotions/${id}`, data),
  delete: (id) => apiConstSaleService.delete(`/promotions/${id}`),
  getByStatus: (status) =>
    apiConstSaleService.get(`/promotions/status/${status}`),
  authenticPromotion: (id) =>
    apiConstSaleService.put(`/promotions/authentic/${id}`),
};

export default promotionService;

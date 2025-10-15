import apiConst from '../../../../services/apiConst.js';

export const promotionService = {
  getAll: () => apiConst.get('/promotions'),
  getById: (id) => apiConst.get(`/promotions/${id}`),
  create: (data) => apiConst.post('/promotions', data),
  update: (id, data) => apiConst.put(`/promotions/${id}`, data),
  delete: (id) => apiConst.delete(`/promotions/${id}`),
  getByStatus: (status) => apiConst.get(`/promotions/status/${status}`)
};

export default promotionService;

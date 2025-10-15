import apiConst from '../../../../services/apiConst.js';

export const mngUserService = {
    getAll: () => apiConst.get('/users'),
    getById: (id) => apiConst.get(`/users/${id}`),
    createAmind: (userData) => apiConst.post('/users/register/admin', userData),
    createDealerStaff: (userData) => apiConst.post('/users/register/dealerStaff', userData),
    createDealerManager: (userData) => apiConst.post('/users/register/dealerManager', userData),
    createEvmStaff: (userData) => apiConst.post('/users/register/evmStaff', userData),
    update: (id, userData) => apiConst.put(`/users/${id}`, userData),
    delete: (id) => apiConst.delete(`/users/${id}`)
};

export default mngUserService;
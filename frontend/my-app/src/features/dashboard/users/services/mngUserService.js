import apiConstUserService from '../../../../services/apiConstUserService.js';

export const mngUserService = {
    getAll: () => apiConstUserService.get('/users'),
    getById: (id) => apiConstUserService.get(`/users/${id}`),
    createAmind: (userData) => apiConstUserService.post('/users/register/admin', userData),
    createDealerStaff: (userData) => apiConstUserService.post('/users/register/dealerStaff', userData),
    createDealerManager: (userData) => apiConstUserService.post('/users/register/dealerManager', userData),
    createEvmStaff: (userData) => apiConstUserService.post('/users/register/evmStaff', userData),
    update: (id, userData) => apiConstUserService.put(`/users/${id}`, userData),
    delete: (id) => apiConstUserService.delete(`/users/${id}`)
};

export default mngUserService;
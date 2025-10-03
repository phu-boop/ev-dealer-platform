import apiConstUserService from '../../../../services/apiConstUserService.js';

export const mngUserService = {
    getAll: () => apiConstUserService.get('/users'),
    getById: (id) => apiConstUserService.get(`/users/${id}`),
    create: (userData) => apiConstUserService.post('/users/register', userData),
    update: (id, userData) => apiConstUserService.put(`/users/${id}`, userData),
    delete: (id) => apiConstUserService.delete(`/users/${id}`)
};

export default mngUserService;
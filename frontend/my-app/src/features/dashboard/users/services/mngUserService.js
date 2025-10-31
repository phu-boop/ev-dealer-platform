// import apiConst from '../../../../services/apiConst.js';

// export const mngUserService = {
//     getAll: () => apiConst.get('/users'),
//     getById: (id) => apiConst.get(`/users/${id}`),
//     createAmind: (userData) => apiConst.post('/users/register/admin', userData),
//     createDealerStaff: (userData) => apiConst.post('/users/register/dealerStaff', userData),
//     createDealerManager: (userData) => apiConst.post('/users/register/dealerManager', userData),
//     createEvmStaff: (userData) => apiConst.post('/users/register/evmStaff', userData),
//     update: (id, userData) => apiConst.put(`/users/${id}`, userData),
//     delete: (id) => apiConst.delete(`/users/${id}`),
//     getProfile: () => apiConst.post(`/users/profile`, {id_user: sessionStorage.getItem("id_user")}),
//     updateProfile: (profileData) => apiConst.put(`/users/profile`, profileData)
// };

// export default mngUserService;

import apiConst from '../../../../services/apiConst.js';

export const mngUserService = {
    getAll: () => apiConst.get('/users'),
    getById: (id) => apiConst.get(`/users/${id}`),
    createAmind: (userData) => apiConst.post('/users/register/admin', userData),
    createDealerStaff: (userData) => apiConst.post('/users/register/dealerStaff', userData),
    createDealerManager: (userData) => apiConst.post('/users/register/dealerManager', userData),
    createEvmStaff: (userData) => apiConst.post('/users/register/evmStaff', userData),
    update: (id, userData) => apiConst.put(`/users/${id}`, userData),
    delete: (id) => apiConst.delete(`/users/${id}`),
    getProfile: () => apiConst.post(`/users/profile`, {id_user: sessionStorage.getItem("id_user")}),
    updateProfile: (profileData) => apiConst.put(`/users/profile`, profileData),
    
    // New functions for enhanced management
    bulkUpdate: (userIds, updateData) => apiConst.put('/users/bulk-update', { userIds, updateData }),
    changeStatus: (userId, status) => apiConst.patch(`/users/${userId}/status`, { status }),
    getStatistics: () => apiConst.get('/users/statistics'),
    exportUsers: (filters) => apiConst.post('/users/export', filters, { responseType: 'blob' }),
    importUsers: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiConst.post('/users/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default mngUserService;
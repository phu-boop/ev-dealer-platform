import apiConst from '../../../services/apiConst.js';

export const profileService = {
    getProfile: () => apiConst.get(`auth/me`),
    changePassword: (email, newPassword, oldPassword) => apiConst.post(`auth/change-password`, {
        "email": email,
        "oldPassword": oldPassword,
        "newPassword": newPassword
    })
};

export default profileService;
import apiConstUserService from '../../../services/apiConstUserService.js';

export const profileService = {
    getProfile: () => apiConstUserService.get(`auth/me`),
    changePassword: (email, newPassword, oldPassword) => apiConstUserService.post(`auth/change-password`, {
        "email": email,
        "oldPassword": oldPassword,
        "newPassword": newPassword
    })
};

export default profileService;
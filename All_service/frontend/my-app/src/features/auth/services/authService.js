import apiConstUserService from "../../../services/apiConstUserService.js";

export const registerUser = (userData) =>
    apiConstUserService.post("users/register", userData).then((res) => res.data);

export const loginUser = (credentials) =>
    apiConstUserService.post("auth/login", credentials).then((res) => res.data);

export const logout = () =>
    apiConstUserService.post("auth/logout").then((res) => res.data);

export const getInforMe = () =>
    apiConstUserService.get("auth/me").then((res) => res.data);

export const forgotPassword = (email) =>
  apiConstUserService
    .post(`auth/forgot-password?email=${email}`)
    .then((res) => res.data);

export const resetPassword = (email, otp, newPassword) =>
  apiConstUserService
    .post(
      `auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`
    )
    .then((res) => res.data);
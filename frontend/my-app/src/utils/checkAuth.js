// Utility để kiểm tra authentication status
export const isAuthenticated = () => {
  const token = sessionStorage.getItem("token");
  return !!token;
};

export const getToken = () => {
  return sessionStorage.getItem("token");
};

export const clearAuth = () => {
  sessionStorage.clear();
};

export const debugAuth = () => {
  console.log("=== Auth Debug Info ===");
  console.log("Token:", sessionStorage.getItem("token"));
  console.log("Email:", sessionStorage.getItem("email"));
  console.log("Roles:", sessionStorage.getItem("roles"));
  console.log("User ID:", sessionStorage.getItem("id_user"));
  console.log("=====================");
};

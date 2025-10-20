import axios from "axios";

<<<<<<<< HEAD:frontend/my-app/src/services/apiConstSaleService.js
const apiConstSaleService = axios.create({
  baseURL: "http://localhost:8080/sales/",
========
const apiConst = axios.create({
  baseURL: "http://localhost:8080",
>>>>>>>> fb1dc351a748893403463643fedb168a2e63b27e:frontend/my-app/src/services/apiConst.js
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

// Lấy token từ sessionStorage
<<<<<<<< HEAD:frontend/my-app/src/services/apiConstSaleService.js
apiConstSaleService.interceptors.request.use((config) => {
========
apiConst.interceptors.request.use((config) => {
>>>>>>>> fb1dc351a748893403463643fedb168a2e63b27e:frontend/my-app/src/services/apiConst.js
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý khi token hết hạn
<<<<<<<< HEAD:frontend/my-app/src/services/apiConstSaleService.js
apiConstSaleService.interceptors.response.use(
========
apiConst.interceptors.response.use(
>>>>>>>> fb1dc351a748893403463643fedb168a2e63b27e:frontend/my-app/src/services/apiConst.js
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // Gọi refresh API
        const res = await axios.post(
          "http://localhost:8080/auth/refresh",
          {},
          { withCredentials: true }
        );

        // Lấy accessToken mới
        const newToken = res.data.data.accessToken;
        console.log(newToken);
        sessionStorage.setItem("token", newToken);
        // Gửi lại request cũ với token mới
        error.config.headers["Authorization"] = `Bearer ${newToken}`;
<<<<<<<< HEAD:frontend/my-app/src/services/apiConstSaleService.js
        return apiConstSaleService(error.config);
========
        return apiConst(error.config);
>>>>>>>> fb1dc351a748893403463643fedb168a2e63b27e:frontend/my-app/src/services/apiConst.js
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

<<<<<<<< HEAD:frontend/my-app/src/services/apiConstSaleService.js
export default apiConstSaleService;
========
export default apiConst;
>>>>>>>> fb1dc351a748893403463643fedb168a2e63b27e:frontend/my-app/src/services/apiConst.js

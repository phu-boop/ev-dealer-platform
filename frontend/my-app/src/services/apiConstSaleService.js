import axios from "axios";

const apiConst = axios.create({
  baseURL: "http://localhost:8080/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

// Lấy token từ sessionStorage
apiConst.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý khi token hết hạn
apiConst.interceptors.response.use(
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
        return apiConst(error.config);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiConst;

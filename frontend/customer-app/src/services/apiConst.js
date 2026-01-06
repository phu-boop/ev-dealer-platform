import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiConst = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Đính kèm JWT từ sessionStorage
apiConst.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động refresh token nếu access token hết hạn (401)
apiConst.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          sessionStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiConst(originalRequest);
        }
      } catch (refreshError) {
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiConst;

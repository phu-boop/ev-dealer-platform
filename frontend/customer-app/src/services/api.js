import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Lấy token từ sessionStorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  console.log("[API] Request to:", config.url, "Token exists:", !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
    // Decode JWT to check expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      console.log("[API] Token info:", {
        email: payload.sub || payload.email,
        role: payload.role,
        exp: new Date(payload.exp * 1000).toLocaleString(),
        isExpired: isExpired
      });
      
      if (isExpired) {
        console.warn("[API] Token is expired! Clearing session...");
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }
    } catch (e) {
      console.error("[API] Failed to decode token:", e);
    }
  }
  
  return config;
});

// Xử lý khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      // Chỉ redirect đến login nếu user đang ở trang yêu cầu authentication
      // Không redirect nếu đang ở trang public như trang chủ
      const publicPaths = ['/', '/login', '/register'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath)) {
        // Redirect to login chỉ khi không ở trang public
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;


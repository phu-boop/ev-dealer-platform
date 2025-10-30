import axios from 'axios';

// Base URL cho User Service API
const USER_SERVICE_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081';

// Tạo axios instance cho User Service
const apiConstUserService = axios.create({
  baseURL: USER_SERVICE_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token vào header
apiConstUserService.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
apiConstUserService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Unauthorized - có thể redirect về login
        console.error('Unauthorized - Token may be expired');
      } else if (error.response.status === 403) {
        console.error('Forbidden - No permission');
      }
    }
    return Promise.reject(error);
  }
);

export default apiConstUserService;

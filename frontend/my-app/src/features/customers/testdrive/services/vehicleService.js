import axios from 'axios';

const vehicleAPI = axios.create({
  baseURL: 'http://localhost:8080/vehicles/vehicle-catalog',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests
vehicleAPI.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 refresh token
vehicleAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await axios.post('http://localhost:8080/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        sessionStorage.setItem('token', newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return vehicleAPI(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Lấy danh sách tất cả mẫu xe
 * GET /vehicles/vehicle-catalog/models
 */
export const getAllModels = async () => {
  const response = await vehicleAPI.get('/models');
  return response.data;
};

/**
 * Lấy chi tiết mẫu xe (bao gồm các phiên bản)
 * GET /vehicles/vehicle-catalog/models/{modelId}
 */
export const getModelDetails = async (modelId) => {
  const response = await vehicleAPI.get(`/models/${modelId}`);
  return response.data;
};

/**
 * Lấy chi tiết variant
 * GET /vehicles/vehicle-catalog/variants/{variantId}
 */
export const getVariantDetails = async (variantId) => {
  const response = await vehicleAPI.get(`/variants/${variantId}`);
  return response.data;
};

export default {
  getAllModels,
  getModelDetails,
  getVariantDetails,
};

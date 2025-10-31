import axios from "axios";

const apiConstCustomerService = axios.create({
  baseURL: "http://localhost:8080/customers",
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

apiConstCustomerService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiConstCustomerService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await axios.post("http://localhost:8080/auth/refresh", {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        sessionStorage.setItem("token", newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiConstCustomerService(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiConstCustomerService;


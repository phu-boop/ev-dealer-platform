import axios from "axios";

const promotionService = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/sales/promotions/`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

promotionService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getActivePromotions = () =>
  promotionService.get("active").then((res) => res.data);

export default promotionService;


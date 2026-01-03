import axios from "axios";

const vehicleService = axios.create({
  baseURL: `${
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
  }/vehicles/`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

vehicleService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getVehicles = () =>
  vehicleService.get("vehicle-catalog/models").then((res) => res.data);

export const getVehicleById = (id) =>
  vehicleService.get(`vehicle-catalog/models/${id}`).then((res) => res.data);

export const getVariants = (modelId) =>
  vehicleService
    .get(`vehicle-catalog/models/${modelId}/variants`)
    .then((res) => res.data);

export default vehicleService;

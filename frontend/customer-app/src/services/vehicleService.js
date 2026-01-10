import apiPublic from "./apiPublic";
import apiConst from "./apiConst";

// B2C: lấy danh sách model xe điện cho khách hàng (PUBLIC - không cần auth)
export const getVehicles = (page = 0, size = 20, sort = null) => {
  const params = { page, size };
  if (sort) {
    params.sort = sort;
  }
  return apiPublic
    .get("/vehicles/vehicle-catalog/models", { params })
    .then((res) => res.data);
};

// Search vehicles with filters
export const searchVehicles = ({
  keyword = null,
  status = null,
  minPrice = null,
  maxPrice = null,
  minRange = null,
  maxRange = null,
  page = 0,
  size = 20,
  sortBy = "modelName",
  direction = "ASC",
}) => {
  const params = { page, size, sortBy, direction };
  if (keyword) params.keyword = keyword;
  if (status) params.status = status;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  if (minRange) params.minRange = minRange;
  if (maxRange) params.maxRange = maxRange;

  return apiPublic
    .get("/vehicles/vehicle-catalog/models/search", { params })
    .then((res) => res.data);
};

export const getVehicleById = (id) =>
  apiPublic
    .get(`/vehicles/vehicle-catalog/models/${id}`)
    .then((res) => res.data);

export const getVariants = (modelId) =>
  apiPublic
    .get(`/vehicles/vehicle-catalog/models/${modelId}/variants`)
    .then((res) => res.data);

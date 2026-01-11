import apiPublic from "./apiPublic";
import apiConst from "./apiConst";

/**
 * Vehicle Service
 * Provides API methods for vehicle catalog operations
 */

// B2C: lấy danh sách variant xe điện có phân trang (PUBLIC - không cần auth)
export const getVehicles = (params) =>
  apiPublic.get("/vehicles/variants/paginated", { params }).then((res) => res.data);

// B2C: lấy danh sách model xe điện (PUBLIC - không cần auth)
export const getVehicleModels = () =>
  apiPublic.get("/vehicles/vehicle-catalog/models").then((res) => res.data);

export const getVehicleById = (id) =>
  apiPublic
    .get(`/vehicles/vehicle-catalog/models/${id}`)
    .then((res) => res.data);

export const getVariants = (modelId) =>
  apiPublic
    .get(`/vehicles/vehicle-catalog/models/${modelId}/variants`)
    .then((res) => res.data);

// Get vehicle detail by variant ID
export const getVehicleDetail = (variantId) =>
  apiPublic.get(`/vehicles/variants/${variantId}`).then((res) => res.data);

// Get vehicle model detail
export const getModelDetail = (modelId) =>
  apiPublic.get(`/vehicles/models/${modelId}`).then((res) => res.data);

// Search vehicles with filters
export const searchVehicles = (filters) =>
  apiPublic.get("/vehicles/variants/search", { params: filters }).then((res) => res.data);

// Compare vehicles (public endpoint)
export const compareVehicles = (variantIds) =>
  apiPublic.post("/vehicles/vehicle-catalog/public/compare", variantIds).then((res) => res.data);

// Get all features
export const getFeatures = () =>
  apiPublic.get("/vehicles/features").then((res) => res.data);

// Get variants by model
export const getVariantsByModel = (modelId) =>
  apiPublic.get(`/vehicles/models/${modelId}/variants`).then((res) => res.data);


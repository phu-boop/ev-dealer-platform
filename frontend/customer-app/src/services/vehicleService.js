import apiPublic from "./apiPublic";
import apiConst from "./apiConst";

// B2C: lấy danh sách model xe điện cho khách hàng (PUBLIC - không cần auth)
export const getVehicles = () =>
  apiPublic.get("/vehicles/vehicle-catalog/models").then((res) => res.data);

export const getVehicleById = (id) =>
  apiPublic
    .get(`/vehicles/vehicle-catalog/models/${id}`)
    .then((res) => res.data);

export const getVariants = (modelId) =>
  apiPublic
    .get(`/vehicles/vehicle-catalog/models/${modelId}/variants`)
    .then((res) => res.data);


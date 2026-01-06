import apiConst from "./apiConst";

// B2C: lấy danh sách model xe điện cho khách hàng
export const getVehicles = () =>
  apiConst.get("/vehicles/vehicle-catalog/models").then((res) => res.data);

export const getVehicleById = (id) =>
  apiConst
    .get(`/vehicles/vehicle-catalog/models/${id}`)
    .then((res) => res.data);

export const getVariants = (modelId) =>
  apiConst
    .get(`/vehicles/vehicle-catalog/models/${modelId}/variants`)
    .then((res) => res.data);


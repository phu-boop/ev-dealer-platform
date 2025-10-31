import apiConstVehicleService from "../../../../services/apiConstVehicleService.js";

export const fetchModelVehicle = {
  // Basic CRUD
  getAllModelVehicle: () =>
    apiConstVehicleService.get("/vehicle-catalog/models"),
};

export default fetchModelVehicle;

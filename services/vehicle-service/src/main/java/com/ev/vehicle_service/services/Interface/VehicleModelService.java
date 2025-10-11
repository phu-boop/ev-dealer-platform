package com.ev.vehicle_service.services.Interface;

import com.ev.vehicle_service.dto.request.CreateVehicleModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVehicleModelRequest;
import com.ev.vehicle_service.dto.response.VehicleModelDto;
import com.ev.vehicle_service.model.VehicleModel;

import java.util.List;

// Đây là bản hợp đồng, chỉ định nghĩa các chức năng cần có
public interface VehicleModelService {

    List<VehicleModelDto> getAllModels();

    VehicleModelDto getModelDetails(Long id);

    VehicleModel createVehicleModel(CreateVehicleModelRequest request);

    // void deleteVehicleModel(Long id, Long userId);

    void deleteVehicleModel(Long id, String updatedByEmail);

    VehicleModel updateVehicleModel(Long id, UpdateVehicleModelRequest request, String updatedByEmail);
}

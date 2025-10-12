package com.ev.vehicle_service.services.Interface;

// import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.CreateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.dto.response.VariantDetailDto;
import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.model.VehicleVariant;

import java.util.List;

public interface VehicleCatalogService {

    // Lấy danh sách tóm tắt tất cả các Model
    List<ModelSummaryDto> getAllModels();

    // Lấy chi tiết một Model (bao gồm danh sách các Variant của nó)
    ModelDetailDto getModelDetails(Long modelId);

    // Lấy chi tiết của một Variant cụ thể
    VariantDetailDto getVariantDetails(Long variantId);

    // Tạo một Model mới kèm theo các Variant ban đầu
    public VehicleModel createModelWithVariants(CreateModelRequest request);

    // Cập nhật thông tin chung của một Model
    VehicleModel updateModel(Long modelId, UpdateModelRequest request, String updatedByEmail);
    
    // Cập nhật thông tin chi tiết của một Variant
    VehicleVariant updateVariant(Long variantId, UpdateVariantRequest request, String updatedByEmail);

    // Xóa mềm một Model (và tất cả Variant của nó)
    void deactivateModel(Long modelId, String updatedByEmail);

    // Xóa mềm một Variant cụ thể
    void deactivateVariant(Long variantId, String updatedByEmail);
}

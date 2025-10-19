package com.ev.vehicle_service.services.Interface;

// import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.CreateModelRequest;
import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.dto.response.VariantDetailDto;
import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.model.VehicleVariant;
import com.ev.vehicle_service.model.VehicleFeature;

import java.util.List;

public interface VehicleCatalogService {

    List<ModelSummaryDto> getAllModels();

    ModelDetailDto getModelDetails(Long modelId);

    VariantDetailDto getVariantDetails(Long variantId);

    VehicleModel createModelWithVariants(CreateModelRequest request); // Tạo 1 mẫu xe mới (có thể thêm 1 vài phiên bản đi kèm theo)

    VehicleVariant createVariant(Long modelId, CreateVariantRequest request, String createdByEmail); // Tạo phiên bản xe mới

    VehicleModel updateModel(Long modelId, UpdateModelRequest request, String updatedByEmail);
    
    VehicleVariant updateVariant(Long variantId, UpdateVariantRequest request, String updatedByEmail);

    void deactivateModel(Long modelId, String updatedByEmail);

    void deactivateVariant(Long variantId, String updatedByEmail);

    List<Long> searchVariantIdsByCriteria(String keyword, String color, String versionName);

    // --- Methods for Features ---
    List<VehicleFeature> getAllFeatures();
    
    VehicleVariant assignFeatureToVariant(Long variantId, FeatureRequest request, String updatedByEmail);
    
    void unassignFeatureFromVariant(Long variantId, Long featureId, String updatedByEmail);
}

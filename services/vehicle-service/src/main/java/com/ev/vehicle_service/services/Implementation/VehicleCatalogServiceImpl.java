package com.ev.vehicle_service.services.Implementation;

import com.ev.vehicle_service.dto.request.CreateModelRequest;
// import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.response.FeatureDto;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.dto.response.VariantDetailDto;
import com.ev.vehicle_service.model.Enum.VehicleStatus;
import com.ev.vehicle_service.model.Enum.EVMAction;
import com.ev.vehicle_service.model.VehicleFeature;
import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.model.VehicleVariant;
import com.ev.vehicle_service.model.VariantFeature;
import com.ev.vehicle_service.model.VariantFeatureId;
import com.ev.vehicle_service.model.PriceHistory;
import com.ev.vehicle_service.model.VehicleVariantHistory;
import com.ev.vehicle_service.repository.VehicleFeatureRepository;
import com.ev.vehicle_service.repository.VehicleModelRepository;
import com.ev.vehicle_service.repository.VehicleVariantRepository;
import com.ev.vehicle_service.repository.VariantFeatureRepository;
import com.ev.vehicle_service.repository.PriceHistoryRepository;
import com.ev.vehicle_service.repository.VehicleVariantHistoryRepository;
import com.ev.vehicle_service.services.Interface.VehicleCatalogService;
import com.ev.vehicle_service.specification.VehicleVariantSpecification;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class VehicleCatalogServiceImpl implements VehicleCatalogService {

    @Autowired
    private VehicleModelRepository modelRepository;

    @Autowired
    private VehicleVariantRepository variantRepository;
    
    @Autowired 
    private VehicleFeatureRepository featureRepository;

    @Autowired 
    private VariantFeatureRepository variantFeatureRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private VehicleVariantHistoryRepository variantHistoryRepository;

    @Override
    public List<ModelSummaryDto> getAllModels() {
        return modelRepository.findAll().stream()
                .map(this::mapToModelSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    public ModelDetailDto getModelDetails(Long modelId) {
        VehicleModel model = findModelById(modelId);
        return mapToModelDetailDto(model);
    }

    @Override
    public VariantDetailDto getVariantDetails(Long variantId) {
        VehicleVariant variant = findVariantById(variantId);
        return mapToVariantDetailDto(variant);
    }

    @Override
    @Transactional
    public VehicleModel createModelWithVariants(CreateModelRequest request) {
        VehicleModel newModel = new VehicleModel();
        newModel.setModelName(request.getModelName());
        newModel.setBrand(request.getBrand());
        newModel.setSpecificationsJson(request.getSpecificationsJson());
        newModel.setThumbnailUrl(request.getThumbnailUrl());
        newModel.setCreatedBy(request.getCreatedBy());
        VehicleModel savedModel = modelRepository.save(newModel);

        request.getVariants().forEach(variantRequest -> {
            VehicleVariant newVariant = new VehicleVariant();
            newVariant.setVersionName(variantRequest.getVersionName());
            newVariant.setColor(variantRequest.getColor());
            newVariant.setPrice(variantRequest.getPrice());
            newVariant.setImageUrl(variantRequest.getImageUrl());
            newVariant.setSkuCode(variantRequest.getSkuCode());
            newVariant.setStatus(VehicleStatus.IN_PRODUCTION);
            newVariant.setVehicleModel(savedModel);

            // Trạng thái Vehicle nếu để trống thì dùng giá trị mặc định là IN_PRODUCTION.
            VehicleStatus status = (variantRequest.getStatus() != null) ? variantRequest.getStatus() : VehicleStatus.IN_PRODUCTION;
            newVariant.setStatus(status);
            VehicleVariant savedVariant = variantRepository.save(newVariant);

            if (variantRequest.getFeatures() != null && !variantRequest.getFeatures().isEmpty()) {
                variantRequest.getFeatures().forEach(featureRequest -> {
                    VehicleFeature feature = featureRepository.findById(featureRequest.getFeatureId())
                            .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND));

                    VariantFeature variantFeature = new VariantFeature();
                    variantFeature.setId(new VariantFeatureId(savedVariant.getVariantId(), feature.getFeatureId()));
                    variantFeature.setVehicleVariant(savedVariant);
                    variantFeature.setVehicleFeature(feature);
                    variantFeature.setStandard(featureRequest.isStandard());
                    variantFeature.setAdditionalCost(featureRequest.getAdditionalCost());
                    
                    variantFeatureRepository.save(variantFeature);
                });
            }
        });

        return savedModel;
    }

    @Override
    @Transactional
    public VehicleModel updateModel(Long modelId, UpdateModelRequest request, String updatedByEmail) {
        VehicleModel model = findModelById(modelId);
        model.setModelName(request.getModelName());
        model.setBrand(request.getBrand());
        model.setSpecificationsJson(request.getSpecificationsJson());
        model.setUpdatedBy(updatedByEmail);
        return modelRepository.save(model);
    }

    @Override
    @Transactional
    public VehicleVariant updateVariant(Long variantId, UpdateVariantRequest request, String updatedByEmail) {
        // 1. Tìm variant hiện có
        VehicleVariant variant = findVariantById(variantId);

        // <<< LOGIC: KIỂM TRA VÀ LƯU LỊCH SỬ GIÁ >>>
        // So sánh giá cũ với giá mới từ request (chỉ lưu lịch sử nếu giá thực sự thay đổi)
        if (request.getPrice() != null && variant.getPrice().compareTo(request.getPrice()) != 0) {
            
            // Tạo một đối tượng PriceHistory mới
            PriceHistory history = new PriceHistory();
            history.setVehicleVariant(variant);
            history.setOldPrice(variant.getPrice()); // Lấy giá cũ từ variant
            history.setNewPrice(request.getPrice()); // Lấy giá mới từ request
            history.setChangeDate(LocalDateTime.now());
            history.setChangedBy(updatedByEmail); 
            history.setReason(request.getReason()); 
            
            // Lưu lại lịch sử
            priceHistoryRepository.save(history);
        }
        
        saveVariantHistory(variant, EVMAction.UPDATE, updatedByEmail); 
        // 2. Cập nhật thông tin cho variant 

        variant.setVersionName(request.getVersionName());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setStatus(request.getStatus());
        return variantRepository.save(variant);
    }

    @Override
    @Transactional
    public void deactivateModel(Long modelId, String updatedByEmail) {
        VehicleModel model = findModelById(modelId);
        model.getVariants().forEach(variant -> {
            saveVariantHistory(variant, EVMAction.DELETE, updatedByEmail); // Cập nhật lại lịch sử chỉnh sửa
            variant.setStatus(VehicleStatus.DISCONTINUED); // Cập nhật lại trạng thái
            variantRepository.save(variant);
        });
    }

    @Override
    @Transactional
    public void deactivateVariant(Long variantId, String updatedByEmail) {
        VehicleVariant variant = findVariantById(variantId);
        variant.setStatus(VehicleStatus.DISCONTINUED);
        variantRepository.save(variant);
    }

    @Override
    public List<Long> searchVariantIdsByCriteria(String keyword, String color, String versionName) {
        List<Specification<VehicleVariant>> specs = new ArrayList<>();

        // Thêm điều kiện tìm kiếm chung theo keyword
        if (keyword != null && !keyword.isBlank()) {
            specs.add(VehicleVariantSpecification.hasKeyword(keyword));
        }

        // Thêm các điều kiện lọc chi tiết
        if (color != null && !color.isBlank()) {
            specs.add(VehicleVariantSpecification.hasColor(color));
        }
        if (versionName != null && !versionName.isBlank()) {
            specs.add(VehicleVariantSpecification.hasVersionName(versionName));
        }

        Specification<VehicleVariant> finalSpec = specs.stream().reduce(Specification::and).orElse(null);

        List<VehicleVariant> variants = variantRepository.findAll(finalSpec);
        return variants.stream().map(VehicleVariant::getVariantId).collect(Collectors.toList());
    }

    // --- Helper Methods ---

    private VehicleModel findModelById(Long modelId) {
        return modelRepository.findById(modelId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
    }

    private VehicleVariant findVariantById(Long variantId) {
        return variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_VARIANT_NOT_FOUND));
    }

    private ModelSummaryDto mapToModelSummaryDto(VehicleModel model) {
        ModelSummaryDto dto = new ModelSummaryDto();
        dto.setModelId(model.getModelId());
        dto.setModelName(model.getModelName());
        dto.setBrand(model.getBrand());
        return dto;
    }

    private ModelDetailDto mapToModelDetailDto(VehicleModel model) {
        ModelDetailDto dto = new ModelDetailDto();
        dto.setModelId(model.getModelId());
        dto.setModelName(model.getModelName());
        dto.setBrand(model.getBrand());
        dto.setSpecificationsJson(model.getSpecificationsJson());
        dto.setThumbnailUrl(model.getThumbnailUrl());
        dto.setVariants(model.getVariants().stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList()));
        return dto;
    }

    private VariantDetailDto mapToVariantDetailDto(VehicleVariant variant) {
        VariantDetailDto dto = new VariantDetailDto();
        dto.setVariantId(variant.getVariantId());
        dto.setVersionName(variant.getVersionName());
        dto.setColor(variant.getColor());
        dto.setSkuCode(variant.getSkuCode());
        dto.setPrice(variant.getPrice());
        dto.setImageUrl(variant.getImageUrl());
        dto.setStatus(variant.getStatus());
        
        if (variant.getFeatures() != null) {
            dto.setFeatures(variant.getFeatures().stream()
                .map(this::mapToFeatureDto)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    private FeatureDto mapToFeatureDto(VariantFeature variantFeature) {
        FeatureDto dto = new FeatureDto();
        VehicleFeature feature = variantFeature.getVehicleFeature();
        dto.setFeatureId(feature.getFeatureId());
        dto.setFeatureName(feature.getFeatureName());
        dto.setCategory(feature.getCategory());
        dto.setStandard(variantFeature.isStandard());
        dto.setAdditionalCost(variantFeature.getAdditionalCost());
        return dto;
    }

    private void saveVariantHistory(VehicleVariant variant, EVMAction action, String changedByEmail) {
        VehicleVariantHistory history = new VehicleVariantHistory();
        history.setVariantId(variant.getVariantId());
        history.setAction(action);
        history.setChangedBy(changedByEmail);
        history.setActionDate(LocalDateTime.now()); 
    
        // Snapshot dữ liệu
        history.setVersionName(variant.getVersionName());
        history.setColor(variant.getColor());
        history.setPrice(variant.getPrice());
        history.setStatus(variant.getStatus());
        
        variantHistoryRepository.save(history);
    }
}
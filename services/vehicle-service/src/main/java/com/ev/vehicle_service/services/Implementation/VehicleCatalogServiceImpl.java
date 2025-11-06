package com.ev.vehicle_service.services.Implementation;

import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.dto.vehicle.FeatureDto;
import com.ev.common_lib.dto.vehicle.ComparisonDto;
import com.ev.common_lib.dto.inventory.InventoryComparisonDto;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.model.enums.VehicleStatus;
import com.ev.common_lib.model.enums.EVMAction;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.event.ProductUpdateEvent;

import com.ev.vehicle_service.dto.request.CreateModelRequest;
// import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;

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
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class VehicleCatalogServiceImpl implements VehicleCatalogService {

    private static final Logger log = LoggerFactory.getLogger(VehicleCatalogServiceImpl.class);

    private final VehicleModelRepository modelRepository;
    private final VehicleVariantRepository variantRepository;
    private final VehicleFeatureRepository featureRepository;
    private final VariantFeatureRepository variantFeatureRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final VehicleVariantHistoryRepository variantHistoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate; 
    private final ObjectMapper objectMapper; 

    private final RestTemplate restTemplate;

    @Value("${app.services.inventory.url}") 
    private String inventoryServiceUrl;

    @Override
    public List<ModelSummaryDto> getAllModels() {
        return modelRepository.findAllWithVariants().stream()
                .map(this::mapToModelSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    public ModelDetailDto getModelDetails(Long modelId) {
        VehicleModel model = modelRepository.findModelWithDetailsById(modelId)
            .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
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
        newModel.setStatus(request.getStatus() != null ? request.getStatus() : VehicleStatus.COMING_SOON);
        // --- XỬ LÝ DỮ LIỆU HYBRID ---
        // 1. Gán các thông số cốt lõi
        newModel.setBaseRangeKm(request.getBaseRangeKm());
        newModel.setBaseMotorPower(request.getBaseMotorPower());
        newModel.setBaseBatteryCapacity(request.getBaseBatteryCapacity());
        newModel.setThumbnailUrl(request.getThumbnailUrl());
        newModel.setCreatedBy(request.getCreatedBy());

        // 2. Chuyển đổi Map thông số mở rộng thành chuỗi JSON
        try {
            if (request.getExtendedSpecs() != null && !request.getExtendedSpecs().isEmpty()) {
                String jsonString = objectMapper.writeValueAsString(request.getExtendedSpecs());
                newModel.setExtendedSpecsJson(jsonString);
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_JSON_FORMAT); 
        }
        
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
    public VehicleVariant createVariant(Long modelId, CreateVariantRequest request, String createdByEmail) {
        // Tìm mẫu xe cha (parent model)
        VehicleModel parentModel = findModelById(modelId);

        VehicleVariant newVariant = new VehicleVariant();

        newVariant.setVersionName(request.getVersionName());
        newVariant.setColor(request.getColor());
        newVariant.setPrice(request.getPrice());
        newVariant.setSkuCode(request.getSkuCode());
        newVariant.setImageUrl(request.getImageUrl());
        
        // Thiết lập mối quan hệ với mẫu xe cha
        newVariant.setVehicleModel(parentModel);

        VehicleStatus status = (request.getStatus() != null) ? request.getStatus() : VehicleStatus.IN_PRODUCTION;
        newVariant.setStatus(status);
        newVariant.setCreatedBy(createdByEmail);

        return variantRepository.save(newVariant);
    }

    @Override
    @Transactional
    public VehicleModel updateModel(Long modelId, UpdateModelRequest request, String updatedByEmail) {
        VehicleModel model = findModelById(modelId);
        model.setModelName(request.getModelName());
        model.setBrand(request.getBrand());
        model.setStatus(request.getStatus());
        model.setUpdatedBy(updatedByEmail);
        model.setThumbnailUrl(request.getThumbnailUrl());
        // --- XỬ LÝ DỮ LIỆU HYBRID ---
        // 1. Cập nhật các thông số cốt lõi
        model.setBaseRangeKm(request.getBaseRangeKm());
        model.setBaseMotorPower(request.getBaseMotorPower());
        model.setBaseBatteryCapacity(request.getBaseBatteryCapacity());
        model.setBaseChargingTime(request.getBaseChargingTime());
        
        // 2. Cập nhật chuỗi JSON từ Map thông số mở rộng
        try {
            if (request.getExtendedSpecs() != null) {
                String jsonString = objectMapper.writeValueAsString(request.getExtendedSpecs());
                model.setExtendedSpecsJson(jsonString);
            } else {
                model.setExtendedSpecsJson(null); // Cho phép xóa hết thông số mở rộng
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_JSON_FORMAT);
        }

        return modelRepository.save(model);
    }

    @Override
    @Transactional
    public VehicleVariant updateVariant(Long variantId, UpdateVariantRequest request, String updatedByEmail) {
        // 1. Tìm variant hiện có
        VehicleVariant variant = findVariantById(variantId);

        // KIỂM TRA VÀ LƯU LỊCH SỬ GIÁ 
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
        variant.setImageUrl(request.getImageUrl());

        // Dùng if để kiểm tra null, tránh ghi đè giá trị nếu frontend không gửi lên
        if (request.getWholesalePrice() != null) variant.setWholesalePrice(request.getWholesalePrice());
        if (request.getBatteryCapacity() != null) variant.setBatteryCapacity(request.getBatteryCapacity());
        if (request.getChargingTime() != null) variant.setChargingTime(request.getChargingTime());
        if (request.getRangeKm() != null) variant.setRangeKm(request.getRangeKm());
        if (request.getMotorPower() != null) variant.setMotorPower(request.getMotorPower());

        VehicleVariant savedVariant = variantRepository.save(variant);

        // Gửi message lên kafka
        try {
            ProductUpdateEvent event = new ProductUpdateEvent();
            event.setVariantId(savedVariant.getVariantId());
            event.setModelName(savedVariant.getVehicleModel().getModelName());
            event.setVersionName(savedVariant.getVersionName());
            event.setColor(savedVariant.getColor());
            event.setNewPrice(savedVariant.getPrice());
            event.setStatus(savedVariant.getStatus().name());
            event.setImageUrl(savedVariant.getImageUrl());
            
            kafkaTemplate.send("product_events", event);
            
        } catch (Exception e) {
            System.err.println("WARN: Failed to send product update event to Kafka. " + e.getMessage());
        }

        return savedVariant;
    }

    @Override
    @Transactional
    public void deactivateModel(Long modelId, String updatedByEmail) {
        VehicleModel model = findModelById(modelId);

        model.setStatus(VehicleStatus.DISCONTINUED);
        model.setUpdatedBy(updatedByEmail);
        modelRepository.save(model);
        
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

    @Override
    public List<VehicleFeature> getAllFeatures() {
        return featureRepository.findAll();
    }

    @Override
    @Transactional
    public VehicleVariant assignFeatureToVariant(Long variantId, FeatureRequest request, String updatedByEmail) {
        // 1. Tìm variant và feature
        VehicleVariant variant = findVariantById(variantId);
        VehicleFeature feature = featureRepository.findById(request.getFeatureId())
            .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND));

        // 2. Tạo đối tượng quan hệ VariantFeature
        VariantFeature variantFeature = new VariantFeature();
        variantFeature.setId(new VariantFeatureId(variantId, request.getFeatureId()));
        variantFeature.setVehicleVariant(variant);
        variantFeature.setVehicleFeature(feature);
        variantFeature.setStandard(request.isStandard());
        variantFeature.setAdditionalCost(request.getAdditionalCost());
        
        // 3. Lưu lại quan hệ
        variantFeatureRepository.save(variantFeature);
        
        saveVariantHistory(variant, EVMAction.UPDATE, updatedByEmail); // Ghi lại lịch sử
        return variant;
    }

    @Override
    @Transactional
    public void unassignFeatureFromVariant(Long variantId, Long featureId, String updatedByEmail) {
        // 1. Tìm variant để ghi lịch sử
        VehicleVariant variant = findVariantById(variantId);

        // 2. Tạo ID tổng hợp để xóa
        VariantFeatureId id = new VariantFeatureId(variantId, featureId);
        if (!variantFeatureRepository.existsById(id)) {
            throw new AppException(ErrorCode.VARIANT_FEATURE_NOT_FOUND);
        }

        // 3. Xóa quan hệ
        variantFeatureRepository.deleteById(id);
        
        saveVariantHistory(variant, EVMAction.UPDATE, updatedByEmail); // Ghi lại lịch sử
    }

    @Override
    public List<VariantDetailDto> getVariantDetailsByIds(List<Long> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            return new ArrayList<>(); // Trả về danh sách rỗng nếu không có ID nào
        }
        
        // Dùng findAllById để lấy tất cả trong một câu lệnh SQL
        List<VehicleVariant> variants = variantRepository.findAllById(variantIds);
        
        // Map kết quả sang DTO
        return variants.stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList());
    }

    /**
     * Triển khai logic cho API phân trang/tìm kiếm
     */
    @Override
    public Page<VariantDetailDto> getAllVariantsPaginated(String search, Pageable pageable) {
        
        // 1. Tạo Specification
        // Gọi trực tiếp hàm static. Nếu 'search' là null/rỗng, hàm 'hasKeyword' của bạn
        // nên trả về null (như trong code tôi gợi ý ở lần trước)
        Specification<VehicleVariant> spec = VehicleVariantSpecification.hasKeyword(search);

        // (Nếu hasKeyword trả về null khi search rỗng)
        // 2. Thực thi truy vấn
        // JpaRepository.findAll() đủ thông minh để xử lý 'spec' là null (tức là không lọc)
        Page<VehicleVariant> variantPage = variantRepository.findAll(spec, pageable);
        
        // 3. Ánh xạ
        return variantPage.map(this::mapToVariantDetailDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComparisonDto> getComparisonData(List<Long> variantIds, UUID dealerId, HttpHeaders headers) {
        
        // BƯỚC 1: Lấy thông tin chi tiết sản phẩm (Thông số, giá...)
        // Lấy từ database của chính service này (vehicle-service).
        List<VariantDetailDto> vehicleDetails = variantRepository.findAllWithDetailsByIds(variantIds).stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList());

        // BƯỚC 2: Gọi API sang Inventory-Service để lấy thông tin tồn kho
        String inventoryUrl = inventoryServiceUrl + "/inventory/status-by-ids-detailed";
        
        // Tạo request body chứa cả 2 thông tin
        Map<String, Object> requestBody = Map.of(
            "variantIds", variantIds,
            "dealerId", dealerId.toString() // Gửi dealerId để service kho biết
        );
        
        // Chuyển tiếp các header xác thực từ request gốc
        HttpHeaders forwardHeaders = new HttpHeaders();
        if (headers != null) {
            forwardHeaders.addAll(headers);
        }
        // Đảm bảo có Content-Type header
        forwardHeaders.set("Content-Type", "application/json");
        
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, forwardHeaders);

        ResponseEntity<ApiRespond<List<InventoryComparisonDto>>> inventoryResponse;
        try {
            log.debug("Calling inventory-service at: {}", inventoryUrl);
            log.debug("Request headers: {}", forwardHeaders);
            inventoryResponse = restTemplate.exchange(
                inventoryUrl,
                HttpMethod.POST,
                requestEntity,
                // Dùng ParameterizedTypeReference để xử lý kiểu Generic (List<...>)
                new ParameterizedTypeReference<ApiRespond<List<InventoryComparisonDto>>>() {}
            );
        } catch (Exception e) {
            // Xử lý lỗi nếu không gọi được service kho
            log.error("Error calling inventory-service at {}: {}", inventoryUrl, e.getMessage(), e);
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }
        
        if (inventoryResponse.getBody() == null || inventoryResponse.getBody().getData() == null) {
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }
        
        List<InventoryComparisonDto> inventoryStatusList = inventoryResponse.getBody().getData();
        
        // Tạo Map để tra cứu nhanh <VariantId, ThongTinKho>
        Map<Long, InventoryComparisonDto> inventoryMap = inventoryStatusList.stream()
                .collect(Collectors.toMap(InventoryComparisonDto::getVariantId, status -> status));

        // BƯỚC 3: Gộp (Merge) hai luồng dữ liệu
        return vehicleDetails.stream()
            .map(detail -> {
                // Lấy thông tin kho từ Map, nếu không có thì tạo đối tượng rỗng
                InventoryComparisonDto inventoryInfo = inventoryMap.getOrDefault(detail.getVariantId(), new InventoryComparisonDto());
                return new ComparisonDto(detail, inventoryInfo); // Gộp lại
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VariantDetailDto> getAllVariantsForBackfill() {
        // Gọi thẳng repository để lấy tất cả, không phân trang
        List<VehicleVariant> variants = variantRepository.findAll(); 

        // Map sang DTO
        return variants.stream()
            .map(this::mapToVariantDetailDto)
            .collect(Collectors.toList());
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
        dto.setStatus(model.getStatus());
        return dto;
    }

    private ModelDetailDto mapToModelDetailDto(VehicleModel model) {
        ModelDetailDto dto = new ModelDetailDto();
        dto.setModelId(model.getModelId());
        dto.setModelName(model.getModelName());
        dto.setBrand(model.getBrand());
        dto.setStatus(model.getStatus());
        dto.setThumbnailUrl(model.getThumbnailUrl());

        // --- XỬ LÝ DỮ LIỆU HYBRID ---
        // 1. Cập nhật các thông số cốt lõi
        dto.setBaseRangeKm(model.getBaseRangeKm());
        dto.setBaseMotorPower(model.getBaseMotorPower());
        dto.setBaseBatteryCapacity(model.getBaseBatteryCapacity());
        dto.setBaseChargingTime(model.getBaseChargingTime());
        
        // 2. Cập nhật chuỗi JSON từ Map thông số mở rộng
        try {
            if (model.getExtendedSpecsJson() != null && !model.getExtendedSpecsJson().isEmpty()) {
                // Chuyển chuỗi JSON thành Map<String, Object>
                Map<String, Object> extendedSpecs = objectMapper.readValue(
                    model.getExtendedSpecsJson(), 
                    new TypeReference<>() {}
                );
                dto.setExtendedSpecs(extendedSpecs);
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_JSON_FORMAT);
        }

        dto.setVariants(model.getVariants().stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList()));
        return dto;
    }

    private VariantDetailDto mapToVariantDetailDto(VehicleVariant variant) {
        // 1. Lấy đối tượng Model cha để sử dụng cho việc kế thừa
        VehicleModel model = variant.getVehicleModel();
        VariantDetailDto dto = new VariantDetailDto();

        // 2. Map các thông tin cơ bản, không cần logic kế thừa
        dto.setVariantId(variant.getVariantId());
        dto.setVersionName(variant.getVersionName());
        dto.setModelId(model.getModelId());
        dto.setColor(variant.getColor());
        dto.setSkuCode(variant.getSkuCode());
        dto.setPrice(variant.getPrice());
        dto.setImageUrl(variant.getImageUrl());
        dto.setStatus(variant.getStatus());
        dto.setWholesalePrice(variant.getWholesalePrice()); // Giá sỉ là của riêng variant, không kế thừa
        
        // 3. ÁP DỤNG LOGIC KẾ THỪA VÀ GÁN MỘT LẦN DUY NHẤT
        // Xử lý Range: Ưu tiên variant, nếu không có thì lấy của model
        dto.setRangeKm(
            (variant.getRangeKm() != null) ? variant.getRangeKm() : model.getBaseRangeKm()
        );
            
        // Xử lý Motor Power
        dto.setMotorPower(
            (variant.getMotorPower() != null) ? variant.getMotorPower() : model.getBaseMotorPower()
        );
    
        // Xử lý Battery Capacity
        dto.setBatteryCapacity(
            (variant.getBatteryCapacity() != null) ? variant.getBatteryCapacity() : model.getBaseBatteryCapacity()
        );
    
        // Xử lý Charging Time
        dto.setChargingTime(
            (variant.getChargingTime() != null) ? variant.getChargingTime() : model.getBaseChargingTime()
        );
        
        // 4. Map các tính năng (features), logic này giữ nguyên
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
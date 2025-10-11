package com.ev.vehicle_service.services.Implementation;

import com.ev.vehicle_service.services.Interface.VehicleModelService;
import com.ev.vehicle_service.model.Enum.VehicleStatus;
import com.ev.vehicle_service.model.Enum.EVMAction;
import com.ev.vehicle_service.dto.response.FeatureDto;
import com.ev.vehicle_service.dto.response.VehicleModelDto;
import com.ev.vehicle_service.dto.request.CreateVehicleModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVehicleModelRequest;
import com.ev.vehicle_service.model.*;
import com.ev.vehicle_service.repository.VehicleFeatureRepository;
import com.ev.vehicle_service.repository.VehicleModelRepository;
import com.ev.vehicle_service.repository.VehicleModelHistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleModelServiceImpl implements VehicleModelService{
    @Autowired
    private VehicleModelRepository vehicleModelRepository;

    @Autowired
    private VehicleFeatureRepository vehicleFeatureRepository;

    @Autowired
    private VehicleModelHistoryRepository vehicleModelHistoryRepository;

    @Override
    public List<VehicleModelDto> getAllModels() {
        // 1. Lấy tất cả các model từ repository. `findAll` sẽ trả về một list rỗng nếu không có dữ liệu.
        List<VehicleModel> vehicleModels = vehicleModelRepository.findAll();
        
        // 2. Chuyển đổi (map) danh sách các Entity sang danh sách DTO và trả về.
        return vehicleModels.stream()
                .map(this::mapToVehicleModelDto) // Sử dụng helper method mới để chuyển đổi
                .collect(Collectors.toList());
    }
/*========================LẤY CHI TIẾT MẪU XE=====================================================================================*/
    /**
     * Lấy chi tiết một mẫu xe và các tính năng đi kèm.
     * Chuyển đổi Entity sang DTO để trả về cho client.
     */
    @Override
    public VehicleModelDto getModelDetails(Long id) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                // Sử dụng AppException với mã lỗi VEHICLE_MODEL_NOT_FOUND
            .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        // Gọi lại helper method mapToVehicleModelDto
        return mapToVehicleModelDto(vehicleModel);
    }

/*========================CREATE VEHICLE (TẠO MẪU XE)=====================================================================================*/
    /**
     * Tạo một mẫu xe mới từ request DTO.
     * Đây là một transaction, nếu có lỗi xảy ra, toàn bộ sẽ được rollback.
     */
    @Override
    @Transactional
    public VehicleModel createVehicleModel(CreateVehicleModelRequest request) {
        // 1. Tạo và lưu VehicleModel cơ bản
        VehicleModel newModel = new VehicleModel();
        mapRequestToEntity(request, newModel);
        
        // Phải lưu trước để lấy được modelId cho quan hệ
        VehicleModel savedModel = vehicleModelRepository.save(newModel);

        // 2. Xử lý và thêm các tính năng (features)
        if (request.getFeatures() != null && !request.getFeatures().isEmpty()) {
            for (var featureRequest : request.getFeatures()) {
                // Tìm feature tương ứng
                VehicleFeature feature = vehicleFeatureRepository.findById(featureRequest.getFeatureId())
                        .orElseThrow(() -> new EntityNotFoundException("Feature not found with id: " + featureRequest.getFeatureId()));

                // Tạo đối tượng quan hệ ModelFeature
                ModelFeature modelFeature = new ModelFeature();
                modelFeature.setId(new ModelFeatureId(savedModel.getModelId(), feature.getFeatureId()));
                modelFeature.setVehicleModel(savedModel);
                modelFeature.setVehicleFeature(feature);
                modelFeature.setStandard(featureRequest.isStandard());
                modelFeature.setAdditionalCost(featureRequest.getAdditionalCost());
                
                // Thêm vào tập hợp features của model
                savedModel.getFeatures().add(modelFeature);
            }
            savedModel = vehicleModelRepository.save(savedModel); // CẬP NHẬT MỐI QUAN HỆ FEATURES
        }
        // 3. GỌI HÀM LƯU LỊCH SỬ
        saveHistory(savedModel, EVMAction.CREATE, request.getCreatedBy());
        
        return savedModel;
    }
/*=============================DELETE THEO USER_ID================================================================================*/
    /**
     * Xóa mềm một mẫu xe bằng cách chuyển trạng thái.
     */
    // @Override
    // @Transactional
    // public void deleteVehicleModel(Long id, String userId) {
    //     VehicleModel model = vehicleModelRepository.findById(id)
    //             .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
        
    //     model.setStatus(VehicleStatus.DISCONTINUED);
        
    //     vehicleModelRepository.save(model);
    // }
/*==============================DELETE MẪU XE (CHUYỂN TRẠNG THÁI)===============================================================================*/
    @Override
    @Transactional
    public void deleteVehicleModel(Long id, String updatedByEmail) {
        VehicleModel model = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
        
        // 1. GỌI HÀM LƯU LỊCH SỬ (ghi lại trạng thái CŨ trước khi thay đổi)
        saveHistory(model, EVMAction.DELETE, updatedByEmail);

        // 2. Thực hiện logic xóa mềm như bình thường
        model.setStatus(VehicleStatus.DISCONTINUED);
        model.setUpdatedBy(updatedByEmail);
        vehicleModelRepository.save(model);
    }
/*============================UPDATE MẪU XE (CHỈNH SỬA)=================================================================================*/
    @Override
    @Transactional
    public VehicleModel updateVehicleModel(Long id, UpdateVehicleModelRequest request, String updatedByEmail) {
        // 1. Tìm mẫu xe hiện có trong DB
        VehicleModel existingModel = vehicleModelRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        // 2. GHI LẠI LỊCH SỬ (trạng thái CŨ trước khi cập nhật)
        saveHistory(existingModel, EVMAction.UPDATE, updatedByEmail);

        // 3. Cập nhật các trường từ request vào entity đã có
        existingModel.setModelName(request.getModelName());
        existingModel.setBrand(request.getBrand());
        existingModel.setVersion(request.getVersion());
        existingModel.setBatteryCapacity(request.getBatteryCapacity());
        existingModel.setRangeKm(request.getRangeKm());
        existingModel.setBasePrice(request.getBasePrice());
        // ... cập nhật các trường khác nếu có ...
        
        // 4. Cập nhật thông tin người sửa
        existingModel.setUpdatedBy(updatedByEmail);
        
        // 5. Lưu lại vào DB, Hibernate sẽ tự tạo câu lệnh UPDATE
        return vehicleModelRepository.save(existingModel);
    }
/*=============================================================================================================*/
    // --- Helper Methods ---
    /**
     * Hàm mới được thêm vào để chuyển đổi VehicleModel Entity sang VehicleModelDto.
     * Tái sử dụng code cho cả getModelDetails và getAllModels.
     */
    private VehicleModelDto mapToVehicleModelDto(VehicleModel vehicleModel) {
        VehicleModelDto dto = new VehicleModelDto();
        dto.setModelId(vehicleModel.getModelId());
        dto.setModelName(vehicleModel.getModelName());
        dto.setBrand(vehicleModel.getBrand());
        dto.setVersion(vehicleModel.getVersion());
        dto.setBatteryCapacity(vehicleModel.getBatteryCapacity());
        dto.setRangeKm(vehicleModel.getRangeKm());
        dto.setBasePrice(vehicleModel.getBasePrice());
        dto.setStatus(vehicleModel.getStatus());

        // Map danh sách features
        if (vehicleModel.getFeatures() != null) {
            dto.setFeatures(vehicleModel.getFeatures().stream()
                    .map(this::mapToFeatureDto)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    // Hàm private để chuyển đổi từ ModelFeature (entity) sang FeatureDto
    private FeatureDto mapToFeatureDto(ModelFeature modelFeature) {
        FeatureDto featureDto = new FeatureDto();
        featureDto.setFeatureId(modelFeature.getVehicleFeature().getFeatureId());
        featureDto.setFeatureName(modelFeature.getVehicleFeature().getFeatureName());
        featureDto.setCategory(modelFeature.getVehicleFeature().getCategory());
        featureDto.setStandard(modelFeature.isStandard());
        featureDto.setAdditionalCost(modelFeature.getAdditionalCost());
        return featureDto;
    }

    // Hàm private để map thông tin từ Request DTO sang Entity
    private void mapRequestToEntity(CreateVehicleModelRequest request, VehicleModel entity) {
        entity.setModelName(request.getModelName());
        entity.setBrand(request.getBrand());
        entity.setVersion(request.getVersion());
        entity.setBatteryCapacity(request.getBatteryCapacity());
        entity.setChargingTime(request.getChargingTime());
        entity.setRangeKm(request.getRangeKm());
        entity.setMotorPower(request.getMotorPower());
        entity.setBasePrice(request.getBasePrice());
        entity.setWholesalePrice(request.getWholesalePrice());
        entity.setSpecificationsJson(request.getSpecificationsJson());
        entity.setColorOptionsJson(request.getColorOptionsJson());
        entity.setStatus(request.getStatus());
        entity.setCreatedBy(request.getCreatedBy());
    }
    private void saveHistory(VehicleModel model, EVMAction action, String changedByEmail) {
        VehicleModelHistory history = new VehicleModelHistory();
    
        history.setModelId(model.getModelId());
        history.setAction(action); // Dùng enum và lấy tên của nó (CREATE, UPDATE, DELETE)
        history.setActionDate(java.time.LocalDateTime.now());
        history.setChangedBy(changedByEmail);
    
        // Sao chép các dữ liệu quan trọng tại thời điểm thay đổi
        history.setModelName(model.getModelName());
        history.setBrand(model.getBrand());
        history.setVersion(model.getVersion());
        history.setBasePrice(model.getBasePrice());
        history.setStatus(model.getStatus()); 
        // ... bạn có thể thêm các trường khác nếu muốn ...
    
        vehicleModelHistoryRepository.save(history);
    }
}

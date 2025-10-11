package com.ev.vehicle_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.vehicle_service.dto.response.VehicleModelDto;

import com.ev.vehicle_service.dto.request.CreateVehicleModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVehicleModelRequest;

import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.services.Interface.VehicleModelService;
import com.ev.vehicle_service.util.JwtUtil;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicle-models")
public class VehicleModelController {
    @Autowired
    private VehicleModelService vehicleModelService;

    @Autowired
    private JwtUtil jwtUtil;

        /**
     * Endpoint mới để lấy toàn bộ danh sách mẫu xe.
     * Quyền: Public
     */
    @GetMapping
    public ResponseEntity<List<VehicleModelDto>> getAllModels() {
        List<VehicleModelDto> allModels = vehicleModelService.getAllModels();
        return ResponseEntity.ok(allModels);
    }

    /**
     * Endpoint lấy chi tiết một mẫu xe theo ID.
     * Sẽ trả về 404 nếu không tìm thấy nhờ GlobalExceptionHandler.
     * Quyền: Public
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleModelDto> getModelById(@PathVariable Long id) {
        VehicleModelDto modelDto = vehicleModelService.getModelDetails(id);
        return ResponseEntity.ok(modelDto);
    }

    /**
     * Endpoint để tạo một mẫu xe mới.
     * Sử dụng @Valid để kích hoạt validation cho DTO.
     * Quyền: EVMStaff/Admin
     */
    @PostMapping
    public ResponseEntity<VehicleModelDto> createModel(@Valid @RequestBody CreateVehicleModelRequest request) {
        VehicleModel createdModel = vehicleModelService.createVehicleModel(request);

        // Chuyển đổi Entity vừa tạo sang DTO để trả về
        VehicleModelDto responseDto = vehicleModelService.getModelDetails(createdModel.getModelId());

        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    /**
     * Endpoint để xóa (ngừng sản xuất) một mẫu xe
     * Quyền: EVM Staff
     */
    @DeleteMapping("/{vehicleModelId}")
    public ResponseEntity<ApiRespond<Void>> deleteModel(
        @PathVariable Long vehicleModelId,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        // Gọi JwtUtil để giải mã token và lấy userId
        // Long userId = jwtUtil.extractUserId(authorizationHeader);

        // JwtUtil giải mã để lấy email user
        String userId = jwtUtil.extractEmail(authorizationHeader);

        // Gọi service với userId thật
        vehicleModelService.deleteVehicleModel(vehicleModelId, userId);

        return ResponseEntity.ok(ApiRespond.success("Vehicle model marked as discontinued", null));
    }

    /**
     * Endpoint để cập nhật thông tin một mẫu xe.
     * Quyền: EVMStaff/Admin
     */
    @PutMapping("/{id}")
    public ResponseEntity<VehicleModelDto> updateModel(
        @PathVariable Long id,
        @Valid @RequestBody UpdateVehicleModelRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        // Lấy email từ token để ghi log
        String email = jwtUtil.extractEmail(authorizationHeader);
        
        // Gọi service để thực hiện việc cập nhật
        VehicleModel updatedModel = vehicleModelService.updateVehicleModel(id, request, email);
        
        // Lấy thông tin chi tiết đã được cập nhật để trả về
        VehicleModelDto responseDto = vehicleModelService.getModelDetails(updatedModel.getModelId());
        
        return ResponseEntity.ok(responseDto);
    }
}

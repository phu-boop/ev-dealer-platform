package com.ev.vehicle_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.vehicle_service.dto.request.CreateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.dto.response.VariantDetailDto;
import com.ev.vehicle_service.model.VehicleModel;
// import com.ev.vehicle_service.model.VehicleVariant;
import com.ev.vehicle_service.services.Interface.VehicleCatalogService;
import com.ev.vehicle_service.util.JwtUtil; 

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicle-catalog") 
public class VehicleCatalogController {

    @Autowired
    private VehicleCatalogService vehicleCatalogService; 

    @Autowired
    private JwtUtil jwtUtil;

    // ==========================================================
    //                    ENDPOINTS FOR MODELS
    // ==========================================================

    /**
     * Lấy danh sách tóm tắt tất cả các mẫu xe.
     */
    @GetMapping("/models")
    public ResponseEntity<ApiRespond<List<ModelSummaryDto>>> getAllModels() {
        List<ModelSummaryDto> allModels = vehicleCatalogService.getAllModels();
        return ResponseEntity.ok(ApiRespond.success("Fetched all models successfully", allModels));
    }

    /**
     * Lấy chi tiết một mẫu xe (bao gồm các phiên bản của nó).
     */
    @GetMapping("/models/{modelId}")
    public ResponseEntity<ApiRespond<ModelDetailDto>> getModelDetails(@PathVariable Long modelId) {
        ModelDetailDto modelDto = vehicleCatalogService.getModelDetails(modelId);
        return ResponseEntity.ok(ApiRespond.success("Fetched model details successfully", modelDto));
    }

    /**
     * Tạo một mẫu xe mới kèm theo các phiên bản ban đầu.
     */
    @PostMapping("/models")
    public ResponseEntity<ApiRespond<ModelDetailDto>> createModelWithVariants(@Valid @RequestBody CreateModelRequest request) {
        VehicleModel createdModel = vehicleCatalogService.createModelWithVariants(request);
        ModelDetailDto responseDto = vehicleCatalogService.getModelDetails(createdModel.getModelId());
        return new ResponseEntity<>(ApiRespond.success("Model created successfully", responseDto), HttpStatus.CREATED);
    }

    /**
     * Cập nhật thông tin chung của một mẫu xe.
     */
    @PutMapping("/models/{modelId}")
    public ResponseEntity<ApiRespond<ModelDetailDto>> updateModel(
            @PathVariable Long modelId,
            @Valid @RequestBody UpdateModelRequest request,
            @RequestHeader("X-User-Email") String email) {
        vehicleCatalogService.updateModel(modelId, request, email);
        ModelDetailDto updatedDto = vehicleCatalogService.getModelDetails(modelId);
        return ResponseEntity.ok(ApiRespond.success("Model updated successfully", updatedDto));
    }
    
    /**
     * Ngừng sản xuất một mẫu xe (deactivate tất cả các phiên bản của nó).
     */
    @DeleteMapping("/models/{modelId}")
    public ResponseEntity<ApiRespond<Void>> deactivateModel(
            @PathVariable Long modelId,
            @RequestHeader("X-User-Email") String email) {
        vehicleCatalogService.deactivateModel(modelId, email);
        return ResponseEntity.ok(ApiRespond.success("Model and all its variants have been discontinued", null));
    }


    // ==========================================================
    //                   ENDPOINTS FOR VARIANTS
    // ==========================================================

    // <<< ENDPOINT MỚI ĐƯỢC THÊM VÀO ĐÚNG VỊ TRÍ >>>
    /**
     * Tìm kiếm các variant theo từ khóa và trả về danh sách ID.
     * Endpoint này phục vụ cho việc giao tiếp giữa các microservice.
     */
    @GetMapping("/variants/search")
    public ResponseEntity<ApiRespond<List<Long>>> searchVariants(
        @RequestParam(required = false) String keyword, 
        @RequestParam(required = false) String color,
        @RequestParam(required = false) String versionName) {
        List<Long> variantIds = vehicleCatalogService.searchVariantIdsByCriteria(keyword, color, versionName);
        return ResponseEntity.ok(ApiRespond.success("Found variant IDs matching keyword", variantIds));
    }

    /**
     * Lấy chi tiết một phiên bản xe cụ thể.
     */
    @GetMapping("/variants/{variantId}")
    public ResponseEntity<ApiRespond<VariantDetailDto>> getVariantDetails(@PathVariable Long variantId) {
        VariantDetailDto variantDto = vehicleCatalogService.getVariantDetails(variantId);
        return ResponseEntity.ok(ApiRespond.success("Fetched variant details successfully", variantDto));
    }
    
    /**
     * Cập nhật thông tin của một phiên bản xe cụ thể.
     */
    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ApiRespond<VariantDetailDto>> updateVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateVariantRequest request,
            @RequestHeader("X-User-Email") String email) {
        vehicleCatalogService.updateVariant(variantId, request, email);
        VariantDetailDto updatedDto = vehicleCatalogService.getVariantDetails(variantId);
        return ResponseEntity.ok(ApiRespond.success("Variant updated successfully", updatedDto));
    }
    
    /**
     * Ngừng sản xuất một phiên bản xe cụ thể.
     */
    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<ApiRespond<Void>> deactivateVariant(
            @PathVariable Long variantId,
            @RequestHeader("X-User-Email") String email) {
        vehicleCatalogService.deactivateVariant(variantId, email);
        return ResponseEntity.ok(ApiRespond.success("Variant has been discontinued", null));
    }
}

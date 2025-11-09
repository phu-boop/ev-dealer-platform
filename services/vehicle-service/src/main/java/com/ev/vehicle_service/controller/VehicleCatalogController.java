package com.ev.vehicle_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.dto.vehicle.ComparisonDto;

import com.ev.vehicle_service.dto.request.CreateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.request.CreateVariantRequest;
// import com.ev.vehicle_service.dto.response.FeatureDto;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.model.VehicleVariant;
import com.ev.vehicle_service.model.VehicleFeature;
import com.ev.vehicle_service.services.Interface.VehicleCatalogService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpHeaders;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vehicle-catalog") 
public class VehicleCatalogController {

    @Autowired
    private VehicleCatalogService vehicleCatalogService; 

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

    /**
     * Tạo một phiên bản mới cho một mẫu xe đã có.
     */
    @PostMapping("/models/{modelId}/variants")
    public ResponseEntity<ApiRespond<VariantDetailDto>> createVariant(
            @PathVariable Long modelId,
            @Valid @RequestBody CreateVariantRequest request,
            @RequestHeader("X-User-Email") String email) {
        
        // Gọi service để tạo variant
        VehicleVariant createdVariant = vehicleCatalogService.createVariant(modelId, request, email);
        
        // Lấy chi tiết DTO của variant vừa tạo để trả về
        VariantDetailDto responseDto = vehicleCatalogService.getVariantDetails(createdVariant.getVariantId());
        
        return new ResponseEntity<>(ApiRespond.success("Variant created successfully", responseDto), HttpStatus.CREATED);
    }
    /**
     * Lấy tất cả các phiên bản (variants) thuộc về một mẫu xe cụ thể.
     */
    @GetMapping("/models/{modelId}/variants")
    public ResponseEntity<ApiRespond<List<VariantDetailDto>>> getVariantsByModelId(@PathVariable Long modelId) {
        List<VariantDetailDto> variants = vehicleCatalogService.getVariantsByModelId(modelId);
        return ResponseEntity.ok(ApiRespond.success("Fetched all variants for model successfully", variants));
    }

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

    /**
     * Lấy chi tiết của nhiều phiên bản xe dựa trên danh sách ID.
     */
    @PostMapping("/variants/details-by-ids")
    public ResponseEntity<ApiRespond<List<VariantDetailDto>>> getVariantDetailsByIds(@RequestBody List<Long> variantIds) {
        List<VariantDetailDto> variants = vehicleCatalogService.getVariantDetailsByIds(variantIds);
        return ResponseEntity.ok(ApiRespond.success("Fetched variant details successfully", variants));
    }

    /**
     * Lấy dữ liệu gộp để so sánh các phiên bản.
     * Nhận vào danh sách các ID của phiên bản cần so sánh.
     */
    @PostMapping("/compare")
    // THÊM CHÚ THÍCH @PreAuthorize NÀY:
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF','DEALER_MANAGER', 'DEALER_STAFF') or " +
                  "( (hasAnyRole('DEALER_MANAGER', 'DEALER_STAFF')) and " +
                  "  #dealerId.toString() == authentication.details['profileId'] )")
    public ResponseEntity<ApiRespond<List<ComparisonDto>>> getComparisonDetails(
            @RequestBody List<Long> variantIds,
            @RequestHeader("X-User-ProfileId") UUID dealerId,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        // Tạo HttpHeaders để chuyển tiếp các header xác thực đến inventory-service
        HttpHeaders headers = new HttpHeaders();
        if (email != null) headers.set("X-User-Email", email);
        if (role != null) headers.set("X-User-Role", role);
        if (userId != null) headers.set("X-User-Id", userId);
        if (dealerId != null) headers.set("X-User-ProfileId", dealerId.toString());
        
        List<ComparisonDto> results = vehicleCatalogService.getComparisonData(variantIds, dealerId, headers);
        return ResponseEntity.ok(ApiRespond.success("Fetched comparison data successfully", results));
    }

    /**
     * Lấy tất cả các phiên bản (variants) có phân trang và tìm kiếm.
     */
    @GetMapping("/variants/paginated")
    public ResponseEntity<ApiRespond<Page<VariantDetailDto>>> getAllVariantsPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status, 
            @PageableDefault(size = 10, sort = "variantId") Pageable pageable) {
        
        // Truyền 'status' xuống service
        Page<VariantDetailDto> results = vehicleCatalogService.getAllVariantsPaginated(search, status, pageable);
        return ResponseEntity.ok(ApiRespond.success("Fetched paginated variants successfully", results));
    }

    /**
     * API MỚI: Lấy TẤT CẢ các phiên bản (không phân trang).
     * Phục vụ riêng cho việc backfill cache của reporting-service.
     */
    @GetMapping("/variants/all-for-backfill")
    public ResponseEntity<ApiRespond<List<VariantDetailDto>>> getAllVariantsForBackfill() {
        List<VariantDetailDto> results = vehicleCatalogService.getAllVariantsForBackfill();
        return ResponseEntity.ok(ApiRespond.success("Fetched all variants for backfill", results));
    }

    /**
     * Lấy TẤT CẢ các ID của phiên bản (dùng cho giao tiếp nội bộ)
     */
    @GetMapping("/variants/all-ids")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')") // Chỉ nội bộ
    public ResponseEntity<ApiRespond<List<Long>>> getAllVariantIds() {
        List<Long> ids = vehicleCatalogService.getAllVariantIds();
        return ResponseEntity.ok(ApiRespond.success("Fetched all variant IDs", ids));
    }

    // ==========================================================
    //          ENDPOINTS FOR FEATURES
    // ==========================================================

    /**
     * Lấy danh sách tất cả các tính năng có sẵn.
     */
    @GetMapping("/features")
    public ResponseEntity<ApiRespond<List<VehicleFeature>>> getAllFeatures() {
        List<VehicleFeature> features = vehicleCatalogService.getAllFeatures();
        return ResponseEntity.ok(ApiRespond.success("Fetched all features successfully", features));
    }

    /**
     * Gán một tính năng cho một phiên bản.
     */
    @PostMapping("/variants/{variantId}/features")
    public ResponseEntity<ApiRespond<VariantDetailDto>> assignFeature(
            @PathVariable Long variantId,
            @Valid @RequestBody FeatureRequest request,
            @RequestHeader("X-User-Email") String email) {

        vehicleCatalogService.assignFeatureToVariant(variantId, request, email);
        VariantDetailDto updatedVariant = vehicleCatalogService.getVariantDetails(variantId);
        return ResponseEntity.ok(ApiRespond.success("Feature assigned successfully", updatedVariant));
    }

    /**
     * Bỏ gán một tính năng khỏi một phiên bản.
     */
    @DeleteMapping("/variants/{variantId}/features/{featureId}")
    public ResponseEntity<ApiRespond<Void>> unassignFeature(
            @PathVariable Long variantId,
            @PathVariable Long featureId,
            @RequestHeader("X-User-Email") String email) {
        
        vehicleCatalogService.unassignFeatureFromVariant(variantId, featureId, email);
        return ResponseEntity.ok(ApiRespond.success("Feature unassigned successfully", null));
    }
}

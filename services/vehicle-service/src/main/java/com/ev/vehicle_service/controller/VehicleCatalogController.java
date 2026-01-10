package com.ev.vehicle_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.vehicle_service.dto.request.CreateModelRequest;
import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.model.VehicleVariant;
import com.ev.vehicle_service.services.Interface.VehicleCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicle-catalog")
@RequiredArgsConstructor
public class VehicleCatalogController {

    private final VehicleCatalogService vehicleCatalogService;

    // ==========================================================
    // ENDPOINTS FOR MODELS
    // ==========================================================

    /**
     * Lấy danh sách tóm tắt tất cả các mẫu xe.
     * OPTIMIZED: Có pagination và caching
     */
    @GetMapping("/models")
    public ResponseEntity<ApiRespond<Page<ModelSummaryDto>>> getAllModels(
            @RequestParam(required = false) Sort sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Sort sortToUse = (sort != null && sort.isSorted()) ? sort : Sort.by(Sort.Direction.ASC, "modelName");
        Pageable pageable = PageRequest.of(page, size, sortToUse);

        Page<ModelSummaryDto> models = vehicleCatalogService.getAllModelsPaginated(pageable);
        return ResponseEntity.ok(ApiRespond.success("Fetched all models successfully", models));
    }

    /**
     * Search models with filters - OPTIMIZED
     */
    @GetMapping("/models/search")
    public ResponseEntity<ApiRespond<Page<ModelSummaryDto>>> searchModels(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Integer minRange,
            @RequestParam(required = false) Integer maxRange,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "modelName") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<ModelSummaryDto> models = vehicleCatalogService.searchModels(
                keyword, status, minPrice, maxPrice, minRange, maxRange, pageable);
        return ResponseEntity.ok(ApiRespond.success("Search completed", models));
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
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<ModelDetailDto>> createModelWithVariants(
            @Valid @RequestBody CreateModelRequest request) {
        VehicleModel createdModel = vehicleCatalogService.createModelWithVariants(request);
        ModelDetailDto responseDto = vehicleCatalogService.getModelDetails(createdModel.getModelId());
        return new ResponseEntity<>(ApiRespond.success("Model created successfully", responseDto), HttpStatus.CREATED);
    }

    /**
     * Cập nhật thông tin chung của một mẫu xe.
     */
    @PutMapping("/models/{modelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<ModelDetailDto>> updateModel(
            @PathVariable Long modelId,
            @Valid @RequestBody UpdateModelRequest request,
            @RequestHeader("X-User-Email") String email) {
        VehicleModel updatedModel = vehicleCatalogService.updateModel(modelId, request, email);
        ModelDetailDto responseDto = vehicleCatalogService.getModelDetails(updatedModel.getModelId());
        return ResponseEntity.ok(ApiRespond.success("Model updated successfully", responseDto));
    }

    /**
     * Xóa một mẫu xe (soft delete).
     */
    @DeleteMapping("/models/{modelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> deleteModel(
            @PathVariable Long modelId,
            @RequestHeader("X-User-Email") String email) {
        vehicleCatalogService.deactivateModel(modelId, email);
        return ResponseEntity.ok(ApiRespond.success("Model deleted successfully", null));
    }

    // ==========================================================
    // ENDPOINTS FOR VARIANTS
    // ==========================================================

    /**
     * Tạo một phiên bản mới cho một mẫu xe đã có.
     */
    @PostMapping("/models/{modelId}/variants")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<VariantDetailDto>> createVariant(
            @PathVariable Long modelId,
            @Valid @RequestBody CreateVariantRequest request,
            @RequestHeader("X-User-Email") String email) {

        // Gọi service để tạo variant
        VehicleVariant createdVariant = vehicleCatalogService.createVariant(modelId, request, email);

        // Lấy chi tiết DTO của variant vừa tạo để trả về
        VariantDetailDto responseDto = vehicleCatalogService.getVariantDetails(createdVariant.getVariantId());

        return new ResponseEntity<>(ApiRespond.success("Variant created successfully", responseDto),
                HttpStatus.CREATED);
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
     * Cập nhật thông tin một phiên bản xe.
     */
    @PutMapping("/variants/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<VariantDetailDto>> updateVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateVariantRequest request,
            @RequestHeader("X-User-Email") String email) {
        VehicleVariant updatedVariant = vehicleCatalogService.updateVariant(variantId, request, email);
        VariantDetailDto responseDto = vehicleCatalogService.getVariantDetails(updatedVariant.getVariantId());
        return ResponseEntity.ok(ApiRespond.success("Variant updated successfully", responseDto));
    }

    /**
     * Xóa một phiên bản xe (soft delete).
     */
    @DeleteMapping("/variants/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> deleteVariant(
            @PathVariable Long variantId,
            @RequestHeader("X-User-Email") String email) {
        vehicleCatalogService.deactivateVariant(variantId, email);
        return ResponseEntity.ok(ApiRespond.success("Variant deleted successfully", null));
    }
}

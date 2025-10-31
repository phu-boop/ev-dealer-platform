package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.QuotationRequestDTO;
import com.ev.sales_service.dto.response.QuotationResponseDTO;
import com.ev.sales_service.enums.QuotationStatus;
import com.ev.sales_service.dto.outbound.UpdateQuotationStatusDTO;
import com.ev.sales_service.service.QuotationService;
import jakarta.validation.Valid; // <-- Import để kích hoạt validation
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;

    /**
     * API để tạo báo giá mới
     * @param request DTO chứa variantId, customerId và danh sách promotionIds
     * @return DTO chứa thông tin báo giá đã được tính toán
     */
    @PostMapping
    public ResponseEntity<QuotationResponseDTO> createQuotation(
            @Valid @RequestBody QuotationRequestDTO request,
            @RequestHeader("X-Staff-Id") UUID staffId,
            @RequestHeader("X-Dealer-Id") UUID dealerId) {

        // SỬA: Truyền ID vào service
        QuotationResponseDTO response = quotationService.createQuotation(request, staffId, dealerId);

        return ResponseEntity.ok(response);
    }

    /**
     * API MỚI: Cho Staff lấy báo giá của CHÍNH MÌNH
     */
    @GetMapping("/my")
    public ResponseEntity<List<QuotationResponseDTO>> getMyQuotations(
            @RequestHeader("X-Staff-Id") UUID staffId,
            @RequestParam(required = false) QuotationStatus status) {

        List<QuotationResponseDTO> response;
        if (status != null) {
            response = quotationService.getMyQuotationsByStatus(staffId, status);
        } else {
            response = quotationService.getMyQuotations(staffId);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * API lấy chi tiết một báo giá
     * (Phục vụ EDMS-35: Xem chi tiết & Chỉnh sửa)
     */
    @GetMapping("/{quotationId}")
    public ResponseEntity<QuotationResponseDTO> getQuotationById(
            @PathVariable UUID quotationId) {

        QuotationResponseDTO response = quotationService.getQuotationDetailsById(quotationId);
        return ResponseEntity.ok(response);
    }

    /**
     * API cho Manager lấy danh sách báo giá của đại lý
     * Có thể lọc theo trạng thái (ví dụ: ?status=PENDING)
     *
     * @param dealerId ID của đại lý (truyền qua URL)
     * @param status Trạng thái (truyền qua query param, không bắt buộc)
     * @return Danh sách báo giá
     */
    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<List<QuotationResponseDTO>> getQuotationsForDealer(
            @PathVariable UUID dealerId,
            @RequestParam(required = false) QuotationStatus status) {

        List<QuotationResponseDTO> response;

        if (status != null) {
            // Nếu có lọc status (ví dụ: ?status=PENDING)
            response = quotationService.getQuotationsByDealerIdAndStatus(dealerId, status);
        } else {
            // Lấy tất cả
            response = quotationService.getQuotationsByDealerId(dealerId);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * API cho Manager duyệt (APPROVE) hoặc từ chối (REJECT) báo giá
     *
     * @param quotationId ID của báo giá (từ URL)
     * @param request     Body chứa status mới (APPROVED hoặc REJECTED)
     * @return Báo giá đã được cập nhật
     */
    @PutMapping("/{quotationId}/status")
    public ResponseEntity<QuotationResponseDTO> updateQuotationStatus(
            @PathVariable UUID quotationId,
            @Valid @RequestBody UpdateQuotationStatusDTO request,
            @RequestHeader("X-User-Role") String userRole) {

        // Gọi service để xử lý logic
        QuotationResponseDTO response = quotationService.updateQuotationStatus(
                quotationId,
                request.getStatus(),
                userRole
        );

        return ResponseEntity.ok(response);
    }

    /**
     * API cho Manager chỉnh sửa báo giá đang ở trạng thái PENDING hoặc DRAFT
     *
     * @param quotationId ID của báo giá cần sửa (từ URL)
     * @param request     Body chứa thông tin báo giá mới (dùng lại QuotationRequestDTO)
     * @return Báo giá đã được cập nhật
     */
    @PutMapping("/{quotationId}")
    public ResponseEntity<QuotationResponseDTO> updateQuotation(
            @PathVariable UUID quotationId,
            @Valid @RequestBody QuotationRequestDTO request,
            @RequestHeader("X-Staff-Id") UUID staffId,
            @RequestHeader("X-Dealer-Id") UUID dealerId,
            @RequestHeader("X-User-Role") String userRole) {

        QuotationResponseDTO response = quotationService.updateQuotation(
                quotationId,
                request,
                staffId,
                dealerId,
                userRole
        );

        return ResponseEntity.ok(response);
    }
}
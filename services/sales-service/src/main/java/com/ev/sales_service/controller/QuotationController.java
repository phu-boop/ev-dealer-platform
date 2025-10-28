package com.ev.sales_service.controller;

import com.ev.sales_service.dto.outbound.QuotationRequestDTO;
import com.ev.sales_service.dto.outbound.QuotationResponseDTO;
import com.ev.sales_service.enums.QuotationStatus;
import com.ev.sales_service.dto.request.UpdateQuotationStatusDTO;
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
     * API để tạo báo giá mới (Thực thi story EDMS-34 và EVDMS-44)
     * @param request DTO chứa variantId, customerId và danh sách promotionIds
     * @return DTO chứa thông tin báo giá đã được tính toán
     */
    @PostMapping
    public ResponseEntity<QuotationResponseDTO> createQuotation(
            @Valid @RequestBody QuotationRequestDTO request) {

        // Gọi service để xử lý toàn bộ logic nghiệp vụ
        QuotationResponseDTO response = quotationService.createQuotation(request);

        // Trả về 200 OK cùng với dữ liệu báo giá
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
     * (Thực thi story EDMS-35)
     *
     * @param quotationId ID của báo giá (từ URL)
     * @param request     Body chứa status mới (APPROVED hoặc REJECTED)
     * @return Báo giá đã được cập nhật
     */
    @PutMapping("/{quotationId}/status")
    public ResponseEntity<QuotationResponseDTO> updateQuotationStatus(
            @PathVariable UUID quotationId,
            @Valid @RequestBody UpdateQuotationStatusDTO request) {

        // Gọi service để xử lý logic
        QuotationResponseDTO response = quotationService.updateQuotationStatus(
                quotationId,
                request.getStatus()
        );

        return ResponseEntity.ok(response);
    }

}
package com.ev.sales_service.controller;

import com.ev.sales_service.dto.outbound.QuotationRequestDTO;
import com.ev.sales_service.dto.outbound.QuotationResponseDTO;
import com.ev.sales_service.service.QuotationService;
import jakarta.validation.Valid; // <-- Import để kích hoạt validation
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    // TODO: Thêm các API cho Giai đoạn 2 (EDMS-35: Duyệt/Sửa báo giá)
    // @PutMapping("/{id}/approve")
    // @GetMapping("/dealer/{dealerId}")
}
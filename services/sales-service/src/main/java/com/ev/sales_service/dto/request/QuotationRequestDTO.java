package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class QuotationRequestDTO {

    // Yêu cầu (Chọn mẫu xe, phiên bản, màu sắc) -> quy về variantId
    @NotNull(message = "Variant ID is required")
    private Long variantId;

    // Yêu cầu (Nhập thông tin khách hàng) -> quy về customerId
    @NotNull(message = "Customer ID is required")
    private Long customerId; // Phải là Long để khớp với Entity

    // Yêu cầu (Áp dụng khuyến mãi)
    private List<UUID> promotionIds;

    // Yêu cầu (Lưu bản nháp) - chúng ta sẽ xử lý logic này trong service
    private Boolean saveAsDraft = false;

    private String termsConditions;
}
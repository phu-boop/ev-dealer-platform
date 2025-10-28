package com.ev.sales_service.dto.outbound;

//import com.ev.sales_service.dto.outbound.PromotionDTO; // Sửa DTO này nếu cần
import com.ev.sales_service.enums.QuotationStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class QuotationResponseDTO {

    private UUID quotationId;
    private Long customerId;
    private Long variantId;
    private Long modelId;
    private UUID staffId;
    private UUID dealerId;

    private LocalDateTime quotationDate;
    private LocalDateTime validUntil;
    private QuotationStatus status;

    // Yêu cầu (Tự động hiển thị giá bán, thuế, và khuyến mãi)
    private BigDecimal basePrice;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    // (Thuế sẽ được tính ở đây nếu cần)

    private String termsConditions;

    // Danh sách các KM đã được áp dụng thành công
    private List<PromotionDTO> appliedPromotions;
}
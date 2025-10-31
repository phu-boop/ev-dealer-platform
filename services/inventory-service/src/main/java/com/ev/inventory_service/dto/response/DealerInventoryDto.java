package com.ev.inventory_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DealerInventoryDto {
    private Long dealerId;
    private Integer allocatedQuantity; // Số lượng đã phân bổ
    private Integer availableQuantity; // Số lượng còn lại
}

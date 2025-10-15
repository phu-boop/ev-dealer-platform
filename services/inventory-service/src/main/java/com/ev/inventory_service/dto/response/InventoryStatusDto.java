package com.ev.inventory_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class InventoryStatusDto {
    private Long variantId;
    private Integer totalInSystem; // Tổng số lượng trong hệ thống
    private Integer centralWarehouseAvailable; // Số lượng còn lại trong kho trung tâm
    private List<DealerInventoryDto> dealerStock; // Số lượng còn lại trong kho đại lý
}

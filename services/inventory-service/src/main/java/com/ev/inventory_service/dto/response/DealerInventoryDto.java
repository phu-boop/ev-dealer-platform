package com.ev.inventory_service.dto.response;

import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.model.enums.InventoryLevelStatus;
import com.ev.inventory_service.model.DealerAllocation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerInventoryDto {

    // Thông tin từ Vehicle Service
    private Long variantId;
    private String modelName;
    private String versionName;
    private String color;
    private String skuCode;

    // Thông tin từ Inventory Service
    private Integer availableQuantity;   // Hàng có sẵn để bán
    private Integer allocatedQuantity;   // Hàng đang trên đường tới (hoặc đang giữ)
    private Integer reorderLevel;        // Ngưỡng đặt lại
    private String status;               // Trạng thái (IN_STOCK, LOW_STOCK)

    // Hàm helper để gộp 2 đối tượng
    public static DealerInventoryDto merge(VariantDetailDto variant, DealerAllocation allocation) {
        InventoryLevelStatus status = InventoryLevelStatus.OUT_OF_STOCK;
        int available = (allocation != null) ? allocation.getAvailableQuantity() : 0;
        int reorder = (allocation != null && allocation.getReorderLevel() != null) ? allocation.getReorderLevel() : 0;

        if (available > reorder) {
            status = InventoryLevelStatus.IN_STOCK;
        } else if (available > 0) {
            status = InventoryLevelStatus.LOW_STOCK;
        }

        return DealerInventoryDto.builder()
                .variantId(variant.getVariantId())
                .modelName(variant.getModelName())
                .versionName(variant.getVersionName())
                .color(variant.getColor())
                .skuCode(variant.getSkuCode())
                .availableQuantity(available)
                .allocatedQuantity((allocation != null) ? allocation.getAllocatedQuantity() : 0)
                .reorderLevel(reorder)
                .status(status.name())
                .build();
    }
}

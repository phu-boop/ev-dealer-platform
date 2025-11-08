package com.ev.vehicle_service.dto.response;

import com.ev.common_lib.model.enums.VehicleStatus; 
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class VariantCatalogDto {
    
    // Thông tin từ VehicleVariant
    private Long variantId;
    private String versionName;
    private String color;
    private String skuCode;
    private BigDecimal price;
    private String imageUrl;
    private VehicleStatus status;
    
    // Thông tin từ VehicleModel (parent)
    private String modelName;
    private String brand;

    // Constructor để mapping dễ dàng (tùy chọn, nhưng hữu ích)
    public VariantCatalogDto(Long variantId, String versionName, String color, String skuCode, 
                             BigDecimal price, String imageUrl, VehicleStatus status, 
                             String modelName, String brand) {
        this.variantId = variantId;
        this.versionName = versionName;
        this.color = color;
        this.skuCode = skuCode;
        this.price = price;
        this.imageUrl = imageUrl;
        this.status = status;
        this.modelName = modelName;
        this.brand = brand;
    }
}

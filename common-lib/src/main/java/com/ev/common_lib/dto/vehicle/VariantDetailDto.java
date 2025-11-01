package com.ev.common_lib.dto.vehicle;

import com.ev.common_lib.model.enums.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VariantDetailDto {
    private Long variantId;
    private String versionName;
    private String color;
    private String skuCode;
    private BigDecimal price;
    private VehicleStatus status;
    private String imageUrl;
    private BigDecimal wholesalePrice;
    private Integer batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm;
    private Integer motorPower;
    private Long modelId;
    
    private List<FeatureDto> features; 
}

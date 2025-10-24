package com.ev.vehicle_service.dto.response;

import com.ev.vehicle_service.model.Enum.VehicleStatus;
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
    
    private List<FeatureDto> features; 
}

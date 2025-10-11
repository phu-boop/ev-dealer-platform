package com.ev.vehicle_service.dto.response;

import com.ev.vehicle_service.model.Enum.VehicleStatus;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VehicleModelDto {
    private Long modelId;
    private String modelName;
    private String brand;
    private String version;
    private Integer batteryCapacity;
    private Integer rangeKm;
    private BigDecimal basePrice;
    private VehicleStatus status;
    private List<FeatureDto> features;
    
}

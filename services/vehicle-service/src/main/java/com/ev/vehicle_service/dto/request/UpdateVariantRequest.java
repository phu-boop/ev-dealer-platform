package com.ev.vehicle_service.dto.request;

import com.ev.vehicle_service.model.Enum.VehicleStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateVariantRequest {
    
    @NotBlank(message = "Version name cannot be blank")
    private String versionName;

    @NotBlank(message = "Color cannot be blank")
    private String color;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private BigDecimal price;

    private String imageUrl;

    @NotNull(message = "Status is required")
    private VehicleStatus status;

    private Integer batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm;
    private Integer motorPower;

    private BigDecimal wholesalePrice;

    private String reason;
}

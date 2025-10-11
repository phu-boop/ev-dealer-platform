package com.ev.vehicle_service.dto.request;

import com.ev.vehicle_service.model.Enum.VehicleStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;

@Data
public class UpdateVehicleModelRequest {

    @NotBlank(message = "Model name cannot be blank")
    private String modelName;

    private String brand;
    private String version;
    private Integer batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm;
    private Integer motorPower;

    @Min(value = 0, message = "Price must be non-negative")
    private BigDecimal basePrice;
    private BigDecimal wholesalePrice;
    private String specificationsJson;
    private String colorOptionsJson;
    private VehicleStatus status;
    private Long updatedBy; // Người cập nhật (kiểu dữ liệu "Long" là id của user cập nhật)

    @Valid
    private Set<ModelFeatureRequest> features;
}

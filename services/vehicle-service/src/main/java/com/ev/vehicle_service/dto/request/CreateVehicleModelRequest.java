package com.ev.vehicle_service.dto.request;

import com.ev.vehicle_service.model.Enum.VehicleStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
// import java.util.List;
import java.util.Set;

@Data
public class CreateVehicleModelRequest {
    @NotBlank(message = "Model name cannot be blank")
    private String modelName;

    private String brand;
    private String version;

    private Integer batteryCapacity;
    private Float chargingTime;
    private Integer rangeKm;
    private Integer motorPower;

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private BigDecimal basePrice;

    private BigDecimal wholesalePrice;
    private String specificationsJson; // Dữ liệu JSON dạng chuỗi
    private String colorOptionsJson;   // Dữ liệu JSON dạng chuỗi
    private VehicleStatus status;
    // private Long createdBy; // Giả sử là ID của User 
    private String createdBy; // Email của user (tạm thời)

    @Valid // Kích hoạt validation cho các đối tượng bên trong list
    private Set<ModelFeatureRequest> features;
}

package com.ev.vehicle_service.dto.request;

import com.ev.vehicle_service.model.Enum.*;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.Valid;

@Data
public class CreateVariantRequest {

    @NotBlank(message = "Version name cannot be blank")
    private String versionName;

    @NotBlank(message = "Color cannot be blank")
    private String color;

    @NotBlank(message = "SKU code cannot be blank")
    private String skuCode;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private BigDecimal price;

    @NotNull(message = "Status is required")
    private VehicleStatus status; // Cập nhật trạng thái của Vehicle

    private String imageUrl;
    
    @Valid
    private List<FeatureRequest> features; 
}

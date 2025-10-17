package com.ev.vehicle_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateModelRequest {

    @NotBlank(message = "Model name cannot be blank")
    private String modelName;

    @NotBlank(message = "Brand cannot be blank")
    private String brand;

    private String specificationsJson;
}

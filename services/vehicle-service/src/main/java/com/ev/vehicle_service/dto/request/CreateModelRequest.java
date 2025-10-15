package com.ev.vehicle_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class CreateModelRequest {

    @NotBlank(message = "Model name cannot be blank")
    private String modelName;

    @NotBlank(message = "Brand cannot be blank")
    private String brand;

    private String specificationsJson;
    
    private String createdBy; // Email người tạo

    @Valid
    @NotEmpty(message = "Model must have at least one variant")
    private List<CreateVariantRequest> variants;
}

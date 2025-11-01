package com.ev.vehicle_service.dto.response;

import lombok.Data;

@Data
public class ModelSummaryDto {
    private Long modelId;
    private String modelName;
    private String brand;
}

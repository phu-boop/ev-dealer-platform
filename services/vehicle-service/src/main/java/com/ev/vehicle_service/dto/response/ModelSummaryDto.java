package com.ev.vehicle_service.dto.response;

import com.ev.common_lib.model.enums.VehicleStatus;
import lombok.Data;

@Data
public class ModelSummaryDto {
    private Long modelId;
    private String modelName;
    private String brand;
    private VehicleStatus status;
}

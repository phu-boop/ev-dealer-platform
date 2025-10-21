package com.ev.vehicle_service.dto.response;

import com.ev.vehicle_service.model.Enum.VehicleStatus;
import lombok.Data;

@Data
public class ModelSummaryDto {
    private Long modelId;
    private String modelName;
    private String brand;
    private VehicleStatus status;
}

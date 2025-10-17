package com.ev.vehicle_service.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FeatureDto {
    private Long featureId;
    private String featureName;
    private String category;
    private boolean isStandard;
    private BigDecimal additionalCost;
}

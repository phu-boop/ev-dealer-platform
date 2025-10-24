package com.ev.vehicle_service.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ModelDetailDto {
    private Long modelId;
    private String modelName;
    private String brand;
    private String specificationsJson;
    private String thumbnailUrl;
    private List<VariantDetailDto> variants;
}

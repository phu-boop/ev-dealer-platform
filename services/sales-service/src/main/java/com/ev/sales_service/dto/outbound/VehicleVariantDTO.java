package com.ev.sales_service.dto.outbound;

import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
// KHÔNG import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class VehicleVariantDTO {

    @JsonProperty("variantId")
    private Long variantId;

    @JsonProperty("price")
    private BigDecimal price;

    // SỬA: Thêm @JsonProperty để nó đọc trực tiếp "modelId"
    @JsonProperty("modelId")
    private Long modelId;

    // XÓA BỎ HOÀN TOÀN PHƯƠNG THỨC unpackModelId tại đây
}
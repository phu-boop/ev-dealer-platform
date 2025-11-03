package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

// QuotationCreateRequest.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationCreateRequest {
    @NotNull(message = "Dealer ID is required")
    private UUID dealerId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Model ID is required")
    private Long modelId;

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @NotNull(message = "Staff ID is required")
    private UUID staffId;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    private String termsConditions;
}
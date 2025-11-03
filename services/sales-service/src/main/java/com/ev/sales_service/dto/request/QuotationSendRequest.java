package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// QuotationSendRequest.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationSendRequest {
    @NotNull(message = "Valid until date is required")
    @Future(message = "Valid until must be in the future")
    private LocalDateTime validUntil;

    @NotBlank(message = "Terms conditions are required")
    private String termsConditions;
}
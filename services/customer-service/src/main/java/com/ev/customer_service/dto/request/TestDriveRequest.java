package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestDriveRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Dealer ID is required")
    private Long dealerId;

    @NotNull(message = "Model ID is required")
    private Long modelId;

    private Long staffId;

    @NotNull(message = "Appointment date is required")
    private LocalDateTime appointmentDate;

    private Integer durationMinutes;

    private String status;
}

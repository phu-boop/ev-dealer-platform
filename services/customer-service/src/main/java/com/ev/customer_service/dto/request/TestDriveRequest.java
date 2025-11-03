package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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

    private Long variantId; // Phiên bản xe cụ thể (optional)

    private String staffId; // UUID từ user-service

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDateTime appointmentDate;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer durationMinutes;

    @NotBlank(message = "Test drive location is required")
    private String testDriveLocation; // Địa điểm lái thử

    private String customerNotes; // Ghi chú từ khách hàng

    private String createdBy; // Email người tạo (có thể lấy từ JWT)
}

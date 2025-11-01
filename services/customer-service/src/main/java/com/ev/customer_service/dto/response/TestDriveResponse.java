package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestDriveResponse {

    private Long appointmentId;
    private Long customerId;
    private String customerName;
    private Long dealerId;
    private Long modelId;
    private Long staffId;
    private LocalDateTime appointmentDate;
    private Integer durationMinutes;
    private String status;
    private Integer feedbackRating;
    private String feedbackComment;
    private LocalDateTime createdAt;
}

package com.ev.sales_service.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OrderTrackingResponse {
    private UUID trackId;
    private String status;
    private LocalDateTime updateDate;
    private String notes;
    private UUID updatedBy;
}
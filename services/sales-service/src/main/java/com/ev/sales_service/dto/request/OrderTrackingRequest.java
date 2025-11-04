package com.ev.sales_service.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class OrderTrackingRequest {
    private UUID orderId;
    private String status;
    private String notes;
    private UUID updatedBy;
}
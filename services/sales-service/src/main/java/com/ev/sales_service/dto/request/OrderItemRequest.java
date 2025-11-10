package com.ev.sales_service.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemRequest {
    private UUID orderId;
    private Long variantId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private String itemNotes;
    private String color;
    private String specifications;
}
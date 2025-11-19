package com.ev.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response DTO cho tổng hợp công nợ khách hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDebtSummaryResponse {
    private UUID customerId;
    private String customerName; // Có thể lấy từ Customer Service
    private BigDecimal totalDebt; // Tổng công nợ
    private Integer totalOrders; // Tổng số đơn hàng có công nợ
    private BigDecimal averageDebt; // Công nợ trung bình
}



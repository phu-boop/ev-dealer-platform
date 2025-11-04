package com.ev.sales_service.dto.response;

import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.enums.SaleOderType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Data
public class SalesOrderB2CResponse {
    private UUID orderId;
    private UUID dealerId;
    private UUID customerId;
    private UUID staffId;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private OrderStatusB2C orderStatusB2C;
    private BigDecimal totalAmount;
    private BigDecimal downPayment;
    private Boolean managerApproval;
    private UUID approvedBy;
    private SaleOderType typeOder;
    private LocalDateTime approvalDate;

    // Additional details
    private QuotationResponse quotation;
    private SalesContractResponse salesContract;
    private List<OrderItemResponse> orderItems;
    private List<OrderTrackingResponse> orderTrackings;
}
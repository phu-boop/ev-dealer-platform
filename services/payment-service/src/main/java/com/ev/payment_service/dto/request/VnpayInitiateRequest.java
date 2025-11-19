// com/ev/payment_service/dto/request/VnpayInitiateRequest.java
package com.ev.payment_service.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

public class VnpayInitiateRequest {
    private UUID orderId; // ID của SalesOrder (B2C)
    private Long customerId;
    private BigDecimal totalAmount; // Tổng giá trị đơn hàng (để tạo PaymentRecord)
    private BigDecimal paymentAmount; // Số tiền thanh toán lần này
    private String returnUrl; // URL frontend sẽ nhận redirect về

    // --- BẮT ĐẦU THÊM GETTERS ---
    public UUID getOrderId() { return orderId; }
    public Long getCustomerId() { return customerId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public String getReturnUrl() { return returnUrl; }
    // --- KẾT THÚC THÊM GETTERS ---
}
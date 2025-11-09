package com.ev.payment_service.service.Interface;

import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
import com.ev.payment_service.dto.response.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ICustomerPaymentService {

    InitiatePaymentResponse initiatePayment(UUID orderId, InitiatePaymentRequest request, String userEmail, UUID userProfileId);

    TransactionResponse confirmManualPayment(UUID transactionId, String userEmail, UUID userProfileId);

    List<TransactionResponse> getPaymentHistory(UUID orderId);

    /**
     * Lấy tổng công nợ của một khách hàng
     * @param customerId ID của khách hàng
     * @return Tổng công nợ (remainingAmount từ tất cả PaymentRecord của khách hàng)
     */
    BigDecimal getCustomerTotalDebt(Long customerId);
}
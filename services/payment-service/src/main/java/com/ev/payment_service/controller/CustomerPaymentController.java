package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
import com.ev.payment_service.dto.response.TransactionResponse;
import com.ev.payment_service.service.Interface.ICustomerPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.ev.payment_service.config.UserPrincipal;


import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/customer") // Khớp với Gateway
@RequiredArgsConstructor
@Slf4j
public class CustomerPaymentController {

    private final ICustomerPaymentService customerPaymentService;

    /**
     * API 1: Khởi tạo thanh toán
     * Giai đoạn 2: CUSTOMER, DEALER_STAFF, DEALER_MANAGER
     */
    @PostMapping("/orders/{orderId}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<InitiatePaymentResponse> initiatePayment(
            @PathVariable UUID orderId,
            @Valid @RequestBody InitiatePaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) { // << ĐỔI sang UserPrincipal

        log.info("[CustomerPaymentController] POST /orders/{}/pay - Request: amount={}, paymentMethodId={}, notes={}", 
                orderId, request.getAmount(), request.getPaymentMethodId(), request.getNotes());
        log.info("[CustomerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}", 
                principal != null ? principal.getEmail() : "null", 
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");

        try {
            InitiatePaymentResponse response = customerPaymentService.initiatePayment(
                    orderId, request, principal.getEmail(), principal.getProfileId()
            );
            log.info("[CustomerPaymentController] Payment initiated successfully - TransactionId: {}", 
                    response.getTransactionId());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("[CustomerPaymentController] Error initiating payment for orderId: {}", orderId, e);
            throw e;
        }
    }

    /**
     * API 2: Xác nhận thanh toán (thủ công)
     */
    @PostMapping("/transactions/{transactionId}/confirm")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<TransactionResponse> confirmManualPayment(
            @PathVariable UUID transactionId,
            @AuthenticationPrincipal UserPrincipal principal) { // << ĐỔI sang UserPrincipal

        TransactionResponse response = customerPaymentService.confirmManualPayment(
                transactionId, principal.getEmail(), principal.getProfileId()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * API 3.1: Lấy lịch sử thanh toán của một đơn hàng
     * Giai đoạn 2: CUSTOMER, DEALER_STAFF+ (DEALER_STAFF, DEALER_MANAGER, ADMIN)
     */
    @GetMapping("/orders/{orderId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<List<TransactionResponse>> getPaymentHistory(
            @PathVariable UUID orderId) {

        return ResponseEntity.ok(customerPaymentService.getPaymentHistory(orderId));
    }

    /**
     * API 3.2: Lấy tổng công nợ của một khách hàng
     * Giai đoạn 2: DEALER_STAFF+ (DEALER_STAFF, DEALER_MANAGER, ADMIN)
     */
    @GetMapping("/{customerId}/debt")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<BigDecimal> getCustomerTotalDebt(
            @PathVariable Long customerId) {

        BigDecimal totalDebt = customerPaymentService.getCustomerTotalDebt(customerId);
        return ResponseEntity.ok(totalDebt);
    }

    @GetMapping("/debug-me")
    public ResponseEntity<?> debugMe(@AuthenticationPrincipal UserPrincipal principal) {
        // API này sẽ trả về chính xác những gì Spring Security "biết" về bạn
        return ResponseEntity.ok(principal);
    }

}
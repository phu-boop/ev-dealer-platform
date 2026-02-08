package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
<<<<<<< HEAD
import com.ev.payment_service.dto.response.PaymentRecordResponse;
import com.ev.payment_service.dto.response.PaymentStatisticsResponse;
=======
>>>>>>> newrepo/main
import com.ev.payment_service.dto.response.TransactionResponse;
import com.ev.payment_service.service.Interface.ICustomerPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
<<<<<<< HEAD
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
=======
import org.springframework.data.web.PageableDefault;
>>>>>>> newrepo/main
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.ev.payment_service.config.UserPrincipal;

<<<<<<< HEAD
import java.math.BigDecimal;
import java.time.LocalDateTime;
=======

import java.math.BigDecimal;
>>>>>>> newrepo/main
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/customer") // Khớp với Gateway
@RequiredArgsConstructor
@Slf4j
public class CustomerPaymentController {

<<<<<<< HEAD
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
                                        orderId, request, principal.getEmail(), principal.getProfileId());
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
        @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
        public ResponseEntity<TransactionResponse> confirmManualPayment(
                        @PathVariable UUID transactionId,
                        @RequestBody(required = false) java.util.Map<String, String> request,
                        @AuthenticationPrincipal UserPrincipal principal) {

                String notes = request != null ? request.get("notes") : null;
                String action = request != null ? request.get("action") : "APPROVE"; // Default to APPROVE

                TransactionResponse response = customerPaymentService.confirmManualPayment(
                                transactionId, principal.getEmail(), principal.getProfileId(), notes, action);
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

        /**
         * API 4: Lấy danh sách thanh toán tiền mặt chờ duyệt (B2C orders) - Dealer
         * Manager
         */
        @GetMapping("/pending-cash-payments-b2c")
        @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER')")
        public ResponseEntity<Page<TransactionResponse>> getPendingCashPaymentsB2C(
                        @PageableDefault(size = 10, sort = "transactionDate") Pageable pageable,
                        @AuthenticationPrincipal UserPrincipal principal) {

                log.info("[CustomerPaymentController] GET /pending-cash-payments-b2c");
                log.info("[CustomerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                                principal != null ? principal.getEmail() : "null",
                                principal != null ? principal.getRole() : "null",
                                principal != null ? principal.getProfileId() : "null");

                Page<TransactionResponse> response = customerPaymentService.getPendingCashPaymentsB2C(pageable);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/debug-me")
        public ResponseEntity<?> debugMe(@AuthenticationPrincipal UserPrincipal principal) {
                // API này sẽ trả về chính xác những gì Spring Security "biết" về bạn
                return ResponseEntity.ok(principal);
        }

        /**
         * API 5: Lấy danh sách payment records với filter (Admin)
         */
        @GetMapping("/records")
        @PreAuthorize("hasAuthority('ROLE_ADMIN')")
        public ResponseEntity<Page<PaymentRecordResponse>> filterPaymentRecords(
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
                        @RequestParam(required = false) UUID orderId,
                        @RequestParam(required = false) Long customerId,
                        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

                log.info(
                                "[CustomerPaymentController] GET /records - Filters: status={}, startDate={}, endDate={}, orderId={}, customerId={}",
                                status, startDate, endDate, orderId, customerId);

                Page<PaymentRecordResponse> records = customerPaymentService.filterPaymentRecords(
                                status, startDate, endDate, orderId, customerId, pageable);

                return ResponseEntity.ok(records);
        }

        /**
         * API 6: Lấy thống kê payment (Admin)
         */
        @GetMapping("/statistics")
        @PreAuthorize("hasAuthority('ROLE_ADMIN')")
        public ResponseEntity<PaymentStatisticsResponse> getPaymentStatistics(
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

                log.info("[CustomerPaymentController] GET /statistics - startDate={}, endDate={}", startDate, endDate);

                PaymentStatisticsResponse stats = customerPaymentService.getPaymentStatistics(startDate, endDate);

                return ResponseEntity.ok(stats);
        }
=======
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
            @RequestBody(required = false) java.util.Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String notes = request != null ? request.get("notes") : null;
        TransactionResponse response = customerPaymentService.confirmManualPayment(
                transactionId, principal.getEmail(), principal.getProfileId(), notes
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

    /**
     * API 4: Lấy danh sách thanh toán tiền mặt chờ duyệt (B2C orders) - Dealer Manager
     */
    @GetMapping("/pending-cash-payments-b2c")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER')")
    public ResponseEntity<Page<TransactionResponse>> getPendingCashPaymentsB2C(
            @PageableDefault(size = 10, sort = "transactionDate") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        log.info("[CustomerPaymentController] GET /pending-cash-payments-b2c");
        log.info("[CustomerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}", 
                principal != null ? principal.getEmail() : "null", 
                principal != null ? principal.getRole() : "null",
                principal != null ? principal.getProfileId() : "null");
        
        Page<TransactionResponse> response = customerPaymentService.getPendingCashPaymentsB2C(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/debug-me")
    public ResponseEntity<?> debugMe(@AuthenticationPrincipal UserPrincipal principal) {
        // API này sẽ trả về chính xác những gì Spring Security "biết" về bạn
        return ResponseEntity.ok(principal);
    }
>>>>>>> newrepo/main

}
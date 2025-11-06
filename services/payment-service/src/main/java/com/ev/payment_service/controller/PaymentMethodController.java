package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.PaymentMethodRequest;
import com.ev.payment_service.dto.response.PaymentMethodResponse;
import com.ev.payment_service.service.Interface.IPaymentMethodService;
import jakarta.validation.Valid; // << Import validation
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // << Import bảo mật
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/methods") // << Đường dẫn base
@RequiredArgsConstructor
public class PaymentMethodController {

    private final IPaymentMethodService paymentMethodService;

    /**
     * [ADMIN] Tạo PTTT
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')") // << BẢO MẬT: Chỉ ADMIN
    public ResponseEntity<PaymentMethodResponse> createPaymentMethod(
            @Valid @RequestBody PaymentMethodRequest request) {

        PaymentMethodResponse response = paymentMethodService.createPaymentMethod(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * [ADMIN] Cập nhật PTTT
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')") // << BẢO MẬT: Chỉ ADMIN
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(
            @PathVariable("id") UUID methodId,
            @Valid @RequestBody PaymentMethodRequest request) {

        PaymentMethodResponse response = paymentMethodService.updatePaymentMethod(methodId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * [ADMIN] Lấy tất cả PTTT
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EVM_STAFF')") // << BẢO MẬT: Chỉ ADMIN
    public ResponseEntity<List<PaymentMethodResponse>> getAllPaymentMethods() {
        return ResponseEntity.ok(paymentMethodService.getAllPaymentMethods());
    }

    /**
     * [PUBLIC] Lấy các PTTT đang active cho B2C (trang thanh toán của khách)
     */
    @GetMapping("/active-public")
    @PreAuthorize("permitAll()") // << PUBLIC: Ai cũng gọi được
    public ResponseEntity<List<PaymentMethodResponse>> getActivePublicMethods() {
        return ResponseEntity.ok(paymentMethodService.getActivePublicMethods());
    }

    /**
     * [USER] Lấy chi tiết PTTT theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // << BẢO MẬT: Chỉ cần đăng nhập
    public ResponseEntity<PaymentMethodResponse> getPaymentMethodById(@PathVariable("id") UUID methodId) {
        return ResponseEntity.ok(paymentMethodService.getPaymentMethodById(methodId));
    }
}
package com.ev.payment_service.controller;

import com.ev.payment_service.service.Interface.IVnpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * VNPAY Payment Gateway Controller
 * Xử lý callback từ VNPAY (IPN - Instant Payment Notification)
 */
@RestController
@RequestMapping("/api/v1/payments/gateway")
@RequiredArgsConstructor
@Slf4j
public class VnpayGatewayController {

    private final IVnpayService vnpayService;

    /**
     * VNPAY IPN Callback
     * VNPAY sẽ gọi endpoint này để thông báo kết quả thanh toán (server-to-server)
     * 
     * Endpoint: POST /api/v1/payments/gateway/callback/vnpay-ipn
     * Permissions: PUBLIC (nhưng có validate checksum từ VNPAY)
     */
    @PostMapping("/callback/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIpnCallback(
            @RequestParam Map<String, String> vnpParams) {

        log.info("VNPAY IPN Callback received - Params: {}", vnpParams);

        try {
            // Xử lý IPN callback
            UUID transactionId = vnpayService.processIpnCallback(vnpParams);

            if (transactionId != null) {
                // Trả về response cho VNPAY
                // VNPAY yêu cầu response với format: {"RspCode": "00", "Message": "Confirm Success"}
                return ResponseEntity.ok(Map.of(
                    "RspCode", "00",
                    "Message", "Confirm Success"
                ));
            } else {
                // Payment failed hoặc invalid
                return ResponseEntity.ok(Map.of(
                    "RspCode", "01",
                    "Message", "Order not found or payment failed"
                ));
            }

        } catch (Exception e) {
            log.error("Error processing VNPAY IPN callback - Error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "RspCode", "99",
                        "Message", "Internal error"
                    ));
        }
    }

    /**
     * VNPAY Return URL (Redirect từ VNPAY về frontend)
     * Endpoint này có thể được sử dụng để xử lý redirect từ VNPAY
     * Nhưng thông thường, VNPAY sẽ redirect về frontend, và frontend sẽ gọi API để check status
     * 
     * Endpoint: GET /api/v1/payments/gateway/callback/vnpay-return
     * Permissions: PUBLIC
     */
    @GetMapping("/callback/vnpay-return")
    public ResponseEntity<Map<String, Object>> vnpayReturn(
            @RequestParam Map<String, String> vnpParams) {

        log.info("VNPAY Return URL called - Params: {}", vnpParams);

        try {
            // Validate checksum
            String vnpSecureHash = vnpParams.get("vnp_SecureHash");
            boolean isValid = vnpayService.validateChecksum(vnpParams, vnpSecureHash);

            if (!isValid) {
                log.error("VNPAY Return - Invalid checksum");
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Invalid checksum"
                ));
            }

            // Lấy thông tin từ VNPAY
            String vnpResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnpTransactionStatus = vnpParams.get("vnp_TransactionStatus");
            String vnpTxnRef = vnpParams.get("vnp_TxnRef");

            // Xử lý kết quả (tương tự IPN)
            UUID transactionId = vnpayService.processIpnCallback(vnpParams);

            // Return response để frontend xử lý
            return ResponseEntity.ok(Map.of(
                "success", transactionId != null,
                "transactionId", vnpTxnRef != null ? vnpTxnRef : "",
                "responseCode", vnpResponseCode != null ? vnpResponseCode : "",
                "transactionStatus", vnpTransactionStatus != null ? vnpTransactionStatus : "",
                "message", "00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus) 
                    ? "Payment successful" 
                    : "Payment failed"
            ));

        } catch (Exception e) {
            log.error("Error processing VNPAY return - Error: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Internal error"
            ));
        }
    }
}


package com.ev.payment_service.controller;

import com.ev.payment_service.service.Interface.IVnpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ev.payment_service.dto.request.VnpayInitiateRequest; // Thêm
import jakarta.servlet.http.HttpServletRequest; // Thêm
import jakarta.annotation.security.PermitAll;
import java.util.HashMap;

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
     * ENDPOINT MỚI: Nhận yêu cầu từ Frontend
     */
    @PostMapping("/initiate-b2c")
    public ResponseEntity<Map<String, String>> initiateB2CPayment(
            @RequestBody VnpayInitiateRequest body,
            HttpServletRequest request) {

        try {
            String ipAddr = getClientIpAddr(request); // Lấy IP
            String paymentUrl = vnpayService.initiateB2CPayment(body, ipAddr);

            return ResponseEntity.ok(Map.of("url", paymentUrl));
        } catch (Exception e) {
            log.error("Error initiating VNPAY payment - Error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal error: " + e.getMessage()));
        }
    }

    /**
     * HÀM HELPER: Lấy IP (Copy từ PaymentService)
     */
    private String getClientIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            ip = ip.split(",")[0].trim();
            if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) ip = "127.0.0.1";
            if ("127.0.0.1".equals(ip)) {
                return "139.180.217.147"; // IP test hợp lệ của VNPAY
            }
            return ip;
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty()) {
            if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) ip = "127.0.0.1";
            if ("127.0.0.1".equals(ip)) {
                return "139.180.217.147"; // IP test hợp lệ của VNPAY
            }
            return ip;
        }

        ip = request.getRemoteAddr();
        if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) ip = "127.0.0.1";
        if ("127.0.0.1".equals(ip)) {
            return "139.180.217.147"; // IP test hợp lệ của VNPAY
        }
        return ip;
    }

    /**
     * VNPAY IPN Callback
     * VNPAY sẽ gọi endpoint này để thông báo kết quả thanh toán (server-to-server)
     *
     * Endpoint: POST /api/v1/payments/gateway/callback/vnpay-ipn
     * Permissions: PUBLIC (nhưng có validate checksum từ VNPAY)
     */
    @PostMapping("/callback/vnpay-ipn")
    @PermitAll // CHO PHÉP TRUY CẬP KHÔNG CẦN XÁC THỰC
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
    @PermitAll // CHO PHÉP TRUY CẬP KHÔNG CẦN XÁC THỰC
    public ResponseEntity<Map<String, Object>> vnpayReturn(
            @RequestParam Map<String, String> vnpParams) {

        log.info("VNPAY Return URL called - Params: {}", vnpParams);

        try {
            // Validate checksum sử dụng phương thức từ interface
            boolean isValid = vnpayService.verifyVnpayHash(vnpParams);

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
            String vnpAmount = vnpParams.get("vnp_Amount");

            // Xác định kết quả thanh toán
            boolean isPaymentSuccess = "00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus);

            // Convert amount từ VNPAY format (nhân 100) về định dạng bình thường
            long amount = 0;
            try {
                amount = Long.parseLong(vnpAmount) / 100;
            } catch (Exception e) {
                log.warn("Error parsing amount: {}", vnpAmount);
            }

            // Tạo response map - SỬ DỤNG HashMap THAY VÌ Map.of để có thể thêm các field null
            Map<String, Object> response = new HashMap<>();
            response.put("success", isPaymentSuccess);
            response.put("transactionId", vnpTxnRef != null ? vnpTxnRef : "");
            response.put("responseCode", vnpResponseCode != null ? vnpResponseCode : "");
            response.put("transactionStatus", vnpTransactionStatus != null ? vnpTransactionStatus : "");
            response.put("amount", amount);
            response.put("message", isPaymentSuccess ? "Thanh toán thành công" : "Thanh toán thất bại");

            log.info("VNPAY Return - Payment processed - Success: {}, TransactionId: {}",
                    isPaymentSuccess, vnpTxnRef);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing VNPAY return - Error: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Internal error"
            ));
        }
    }
}


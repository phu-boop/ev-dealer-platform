package com.ev.payment_service.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * VNPAY Configuration
 * Cấu hình VNPAY gateway (sandbox/production)
 */
@Configuration
@Data
public class VnpayConfig {

    @Value("${vnpay.tmn-code:}")
    private String tmnCode; // Terminal Code từ VNPAY

    @Value("${vnpay.hash-secret:}")
    private String hashSecret; // Secret key từ VNPAY

    @Value("${vnpay.url}")
    private String vnpUrl; // VNPAY Payment URL

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl; // URL return sau khi thanh toán

    @Value("${vnpay.ipn-url}")
    private String vnpIpnUrl; // URL IPN callback từ VNPAY

    @Value("${vnpay.command}")
    private String vnpCommand; // Command: pay, refund, etc.

    @Value("${vnpay.order-type}")
    private String vnpOrderType; // Order type

    @Value("${vnpay.locale}")
    private String vnpLocale; // Locale: vn, en

    @Value("${vnpay.currency-code}")
    private String vnpCurrCode; // Currency: VND, USD, etc.

    @Value("${vnpay.version}")
    private String vnpVersion; // VNPAY API version
}

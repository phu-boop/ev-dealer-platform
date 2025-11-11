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

    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpUrl; // VNPAY Payment URL

    @Value("${vnpay.return-url:http://localhost:5173/payment/vnpay-return}")
    private String vnpReturnUrl; // URL return sau khi thanh toán

    @Value("${vnpay.ipn-url:http://localhost:8080/payments/api/v1/payments/gateway/callback/vnpay-ipn}")
    private String vnpIpnUrl; // URL IPN callback từ VNPAY

    @Value("${vnpay.command:pay}")
    private String vnpCommand; // Command: pay, refund, etc.

    @Value("${vnpay.order-type:other}")
    private String vnpOrderType; // Order type

    @Value("${vnpay.locale:vn}")
    private String vnpLocale; // Locale: vn, en

    @Value("${vnpay.currency-code:VND}")
    private String vnpCurrCode; // Currency: VND, USD, etc.

    @Value("${vnpay.version:2.1.0}")
    private String vnpVersion; // VNPAY API version
}



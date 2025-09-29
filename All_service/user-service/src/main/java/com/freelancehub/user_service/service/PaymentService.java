package com.freelancehub.user_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {

    private final String tmnCode;
    private final String hashSecret;
    private final String paymentUrl;
    private final String returnUrl;

    public PaymentService(
            @Value("${vnpay.tmnCode}") String tmnCode,
            @Value("${vnpay.hashSecret}") String hashSecret,
            @Value("${vnpay.paymentUrl}") String paymentUrl,
            @Value("${vnpay.returnUrl}") String returnUrl
    ) {
        this.tmnCode = tmnCode;
        this.hashSecret = hashSecret;
        this.paymentUrl = paymentUrl;
        this.returnUrl = returnUrl;
    }

    // PaymentService (chỉ phần chính, thay vào class của bạn)
    public String createPaymentUrl(String orderId, Long amount, HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        // VNPAY yêu cầu nhân 100
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", "ThanhToanDonHang " + orderId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        params.put("vnp_IpAddr", getClientIpAddr(request));
        params.put("vnp_Locale", "vn");

        // Sắp xếp key theo alphabet
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String key : fieldNames) {
            String value = params.get(key);
            String encKey = URLEncoder.encode(key, StandardCharsets.UTF_8);
            String encValue = URLEncoder.encode(value, StandardCharsets.UTF_8);

            // Dùng encoded key/value cho cả hashData và query (theo sample VNPAY)
            hashData.append(encKey).append("=").append(encValue).append("&");
            query.append(encKey).append("=").append(encValue).append("&");
        }

        // remove trailing &
        String hashDataStr = hashData.substring(0, hashData.length() - 1);
        String queryStr = query.substring(0, query.length() - 1);

        // trim secret to avoid whitespace issue
        String secret = this.hashSecret == null ? "" : this.hashSecret.trim();

        System.out.println("Data for hash (canonical): " + hashDataStr);

        String vnp_SecureHash = hmacSHA512(secret, hashDataStr);
        System.out.println("SecureHash: " + vnp_SecureHash);

        String finalUrl = paymentUrl + "?" + queryStr
                + "&vnp_SecureHashType=HmacSHA512"
                + "&vnp_SecureHash=" + vnp_SecureHash;

        return finalUrl;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hash.append('0');
                hash.append(hex);
            }
            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error while calculating HMAC", e);
        }
    }

    private String getClientIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}

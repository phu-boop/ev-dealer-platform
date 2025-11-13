package com.ev.payment_service.service.Interface;

import java.util.UUID;

/**
 * VNPAY Payment Gateway Service Interface
 */
public interface IVnpayService {

    /**
     * Tạo payment URL từ VNPAY
     * @param transactionId Transaction ID
     * @param amount Số tiền thanh toán (VND)
     * @param orderId Order ID (để hiển thị trên VNPAY)
     * @return Payment URL từ VNPAY
     */
    String createPaymentUrl(UUID transactionId, Long amount, UUID orderId);

    /**
     * Validate và xử lý VNPAY IPN callback
     * @param vnpParams Parameters từ VNPAY callback
     * @return Transaction ID nếu thành công, null nếu thất bại
     */
    UUID processIpnCallback(java.util.Map<String, String> vnpParams);

    /**
     * Validate VNPAY checksum
     * @param vnpParams Parameters từ VNPAY
     * @param vnpSecureHash Secure hash từ VNPAY
     * @return true nếu checksum hợp lệ
     */
    boolean validateChecksum(java.util.Map<String, String> vnpParams, String vnpSecureHash);
}



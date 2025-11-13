package com.ev.payment_service.service.Implementation;

import com.ev.payment_service.config.VnpayConfig;
import com.ev.payment_service.entity.Transaction;
import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.repository.TransactionRepository;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.service.Interface.IVnpayService;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

/**
 * VNPAY Payment Gateway Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VnpayServiceImpl implements IVnpayService {

    private final VnpayConfig vnpayConfig;
    private final TransactionRepository transactionRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    @Override
    public String createPaymentUrl(UUID transactionId, Long amount, UUID orderId) {
        try {
            // Validate transaction exists
            if (!transactionRepository.existsById(transactionId)) {
                log.error("Transaction not found - TransactionId: {}", transactionId);
                throw new AppException(ErrorCode.DATA_NOT_FOUND);
            }

            // Validate VNPAY config
            if (vnpayConfig.getTmnCode() == null || vnpayConfig.getTmnCode().isEmpty() ||
                vnpayConfig.getHashSecret() == null || vnpayConfig.getHashSecret().isEmpty()) {
                log.error("VNPAY config is not set. Please configure VNPAY_TMN_CODE and VNPAY_HASH_SECRET in .env file.");
                throw new AppException(ErrorCode.INTERNAL_ERROR);
            }

            // Tạo các tham số cho VNPAY
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnpayConfig.getVnpVersion());
            vnpParams.put("vnp_Command", vnpayConfig.getVnpCommand());
            vnpParams.put("vnp_TmnCode", vnpayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY yêu cầu amount * 100 (VND)
            vnpParams.put("vnp_CurrCode", vnpayConfig.getVnpCurrCode());
            vnpParams.put("vnp_TxnRef", transactionId.toString());
            vnpParams.put("vnp_OrderInfo", "Thanh toan don hang: " + orderId);
            vnpParams.put("vnp_OrderType", vnpayConfig.getVnpOrderType());
            vnpParams.put("vnp_Locale", vnpayConfig.getVnpLocale());
            vnpParams.put("vnp_ReturnUrl", vnpayConfig.getVnpReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1"); // IP address của client
            vnpParams.put("vnp_CreateDate", String.valueOf(System.currentTimeMillis()));

            // Thêm IPN URL nếu có
            if (vnpayConfig.getVnpIpnUrl() != null && !vnpayConfig.getVnpIpnUrl().isEmpty()) {
                vnpParams.put("vnp_IpnUrl", vnpayConfig.getVnpIpnUrl());
            }

            // Sort parameters theo alphabet
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);

            // Tạo query string
            StringBuilder queryString = new StringBuilder();
            StringBuilder signData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();

            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    // Build query string
                    queryString.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                    queryString.append('=');
                    queryString.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                    // Build sign data
                    signData.append(fieldName);
                    signData.append('=');
                    signData.append(fieldValue);

                    if (itr.hasNext()) {
                        queryString.append('&');
                        signData.append('&');
                    }
                }
            }

            // Tạo secure hash
            String vnpSecureHash = hmacSHA512(vnpayConfig.getHashSecret(), signData.toString());
            queryString.append("&vnp_SecureHash=").append(vnpSecureHash);

            // Tạo payment URL
            String paymentUrl = vnpayConfig.getVnpUrl() + "?" + queryString.toString();
            log.info("VNPAY Payment URL created - TransactionId: {}, Amount: {}, URL: {}", 
                    transactionId, amount, paymentUrl);

            return paymentUrl;

        } catch (Exception e) {
            log.error("Error creating VNPAY payment URL - TransactionId: {}, Error: {}", 
                    transactionId, e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    @Override
    @Transactional
    public UUID processIpnCallback(Map<String, String> vnpParams) {
        try {
            log.info("Processing VNPAY IPN callback - Params: {}", vnpParams);

            // Lấy các tham số từ VNPAY
            String vnpSecureHash = vnpParams.get("vnp_SecureHash");
            String vnpResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnpTransactionStatus = vnpParams.get("vnp_TransactionStatus");
            String vnpTxnRef = vnpParams.get("vnp_TxnRef");
            String vnpAmount = vnpParams.get("vnp_Amount");
            String vnpTransactionNo = vnpParams.get("vnp_TransactionNo");

            // Validate checksum
            if (!validateChecksum(vnpParams, vnpSecureHash)) {
                log.error("VNPAY IPN callback - Invalid checksum - TransactionId: {}", vnpTxnRef);
                return null;
            }

            // Parse transaction ID
            UUID transactionId = UUID.fromString(vnpTxnRef);

            // Tìm transaction
            Transaction transaction = transactionRepository.findById(transactionId)
                    .orElseThrow(() -> {
                        log.error("VNPAY IPN callback - Transaction not found - TransactionId: {}", vnpTxnRef);
                        return new AppException(ErrorCode.DATA_NOT_FOUND);
                    });

            // Kiểm tra transaction đã được xử lý chưa
            if ("SUCCESS".equals(transaction.getStatus())) {
                log.warn("VNPAY IPN callback - Transaction already processed - TransactionId: {}", vnpTxnRef);
                return transactionId;
            }

            // Xử lý kết quả từ VNPAY
            // ResponseCode = "00" và TransactionStatus = "00" là thành công
            if ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus)) {
                // Update transaction status
                transaction.setStatus("SUCCESS");
                transaction.setGatewayTransactionId(vnpTransactionNo);
                transactionRepository.save(transaction);

                log.info("VNPAY IPN callback - Payment successful - TransactionId: {}, VNPAY TransactionNo: {}", 
                        vnpTxnRef, vnpTransactionNo);

                // Auto-confirm payment (giống như confirmManualPayment)
                try {
                    // Lấy PaymentRecord
                    PaymentRecord paymentRecord = transaction.getPaymentRecord();
                    if (paymentRecord != null) {
                        // Update PaymentRecord
                        paymentRecord.setAmountPaid(
                                paymentRecord.getAmountPaid().add(transaction.getAmount())
                        );
                        paymentRecord.setRemainingAmount(
                                paymentRecord.getRemainingAmount().subtract(transaction.getAmount())
                        );

                        // Update status
                        if (paymentRecord.getRemainingAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                            paymentRecord.setStatus("PAID");
                        } else if (paymentRecord.getAmountPaid().compareTo(java.math.BigDecimal.ZERO) > 0) {
                            paymentRecord.setStatus("PARTIALLY_PAID");
                        }

                        paymentRecordRepository.save(paymentRecord);
                        log.info("VNPAY IPN callback - PaymentRecord updated - RecordId: {}, Status: {}", 
                                paymentRecord.getRecordId(), paymentRecord.getStatus());

                        // TODO: Call Sales Service để update order status
                        // Có thể emit event hoặc gọi API trực tiếp
                    }
                } catch (Exception e) {
                    log.error("VNPAY IPN callback - Error updating PaymentRecord - TransactionId: {}, Error: {}", 
                            vnpTxnRef, e.getMessage(), e);
                    // Transaction đã được update thành SUCCESS, nhưng PaymentRecord chưa được update
                    // Có thể retry sau hoặc log để xử lý manual
                }

                return transactionId;
            } else {
                // Payment failed
                transaction.setStatus("FAILED");
                transaction.setGatewayTransactionId(vnpTransactionNo);
                transactionRepository.save(transaction);

                log.warn("VNPAY IPN callback - Payment failed - TransactionId: {}, ResponseCode: {}, TransactionStatus: {}", 
                        vnpTxnRef, vnpResponseCode, vnpTransactionStatus);
                return null;
            }

        } catch (Exception e) {
            log.error("Error processing VNPAY IPN callback - Error: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public boolean validateChecksum(Map<String, String> vnpParams, String vnpSecureHash) {
        try {
            // Remove vnp_SecureHash from params
            Map<String, String> paramsWithoutHash = vnpParams.entrySet().stream()
                    .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()) && 
                                   !"vnp_SecureHashType".equals(entry.getKey()))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            // Sort parameters
            List<String> fieldNames = new ArrayList<>(paramsWithoutHash.keySet());
            Collections.sort(fieldNames);

            // Build sign data
            StringBuilder signData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = paramsWithoutHash.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    signData.append(fieldName);
                    signData.append('=');
                    signData.append(fieldValue);
                    if (itr.hasNext()) {
                        signData.append('&');
                    }
                }
            }

            // Calculate hash
            String calculatedHash = hmacSHA512(vnpayConfig.getHashSecret(), signData.toString());

            // Compare
            return calculatedHash.equals(vnpSecureHash);

        } catch (Exception e) {
            log.error("Error validating VNPAY checksum - Error: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Generate HMAC SHA512 hash
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            log.error("Error generating HMAC SHA512 - Error: {}", e.getMessage(), e);
            return "";
        }
    }

    /**
     * Convert bytes to hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}


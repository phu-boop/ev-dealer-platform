package com.ev.payment_service.service.Implementation;

import com.ev.payment_service.config.VnpayConfig;
import com.ev.payment_service.entity.Transaction;
import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.entity.DealerInvoice;
import com.ev.payment_service.entity.DealerTransaction;
import com.ev.payment_service.entity.DealerDebtRecord;
import com.ev.payment_service.repository.TransactionRepository;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.repository.DealerInvoiceRepository;
import com.ev.payment_service.repository.DealerTransactionRepository;
import com.ev.payment_service.repository.DealerDebtRecordRepository;
import com.ev.payment_service.service.Interface.IVnpayService;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ev.payment_service.service.Interface.IPaymentRecordService;
import com.ev.payment_service.repository.PaymentMethodRepository;
import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.dto.request.VnpayInitiateRequest;
import com.ev.payment_service.enums.PaymentScope;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.RoundingMode;

/**
 * VNPAY Payment Gateway Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VnpayServiceImpl implements IVnpayService {

    private final VnpayConfig vnpayConfig;
    private final TransactionRepository transactionRepository;
    private final DealerTransactionRepository dealerTransactionRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final DealerInvoiceRepository dealerInvoiceRepository;
    private final DealerDebtRecordRepository dealerDebtRecordRepository;
    private final IPaymentRecordService paymentRecordService;
    private final PaymentMethodRepository paymentMethodRepository;

    @Override
    @Transactional
    public String initiateB2CPayment(VnpayInitiateRequest request, String ipAddr) {
        try {
            // 1. Tìm hoặc tạo PaymentRecord (công nợ)
            PaymentRecord record = paymentRecordService.findOrCreateRecord(
                    request.getOrderId(),
                    request.getCustomerId(),
                    request.getTotalAmount()
            );

            // 2. Tìm PaymentMethod cho VNPAY
            PaymentMethod vnpayMethod = paymentMethodRepository.findByMethodName("VNPAY")
                    .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR));

            // 3. Tạo Transaction (lịch sử) ở trạng thái PENDING
            Transaction transaction = new Transaction();
            transaction.setPaymentRecord(record);
            transaction.setPaymentMethod(vnpayMethod);
            transaction.setAmount(request.getPaymentAmount());
            transaction.setStatus("PENDING");
            transaction.setTransactionDate(LocalDateTime.now());
            Transaction savedTransaction = transactionRepository.save(transaction);

            log.info("Created PENDING transaction: {}", savedTransaction.getTransactionId());

            // 4. Tạo VNPAY URL theo đúng logic cũ
            String paymentUrl = createPaymentUrl(
                    savedTransaction.getTransactionId().toString(),
                    request.getOrderId().toString(),
                    request.getPaymentAmount().longValue(),
                    request.getReturnUrl(),
                    ipAddr
            );

            log.info("VNPAY Payment URL created - TransactionId: {}, Amount: {}",
                    savedTransaction.getTransactionId(), request.getPaymentAmount());

            return paymentUrl;

        } catch (Exception e) {
            log.error("Error creating VNPAY payment URL - Error: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    @Override
    @Transactional
    public String initiateDealerInvoicePayment(UUID invoiceId,
                                               UUID dealerId,
                                               BigDecimal amount,
                                               String returnUrl,
                                               String ipAddr) {
        try {
            DealerInvoice invoice = dealerInvoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

            if (!invoice.getDealerId().equals(dealerId)) {
                log.error("Dealer {} tried to pay invoice {} that does not belong to them", dealerId, invoiceId);
                throw new AppException(ErrorCode.FORBIDDEN);
            }

            BigDecimal amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
            BigDecimal remaining = invoice.getTotalAmount().subtract(amountPaid);

            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                log.error("Invalid VNPAY amount {} for invoice {}", amount, invoiceId);
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            if (amount.compareTo(remaining) > 0) {
                log.error("Attempt to pay more than remaining amount - Invoice: {}, Amount: {}, Remaining: {}", invoiceId, amount, remaining);
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            PaymentMethod vnpayMethod = paymentMethodRepository.findByMethodName("VNPAY")
                    .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

            if (vnpayMethod.getScope() != PaymentScope.ALL && vnpayMethod.getScope() != PaymentScope.B2B) {
                log.error("VNPAY method is not enabled for B2B scope - MethodId: {}", vnpayMethod.getMethodId());
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            DealerTransaction transaction = DealerTransaction.builder()
                    .dealerInvoice(invoice)
                    .paymentMethod(vnpayMethod)
                    .amount(amount)
                    .status("PENDING_GATEWAY")
                    .transactionDate(LocalDateTime.now())
                    .build();

            DealerTransaction savedTransaction = dealerTransactionRepository.save(transaction);

            long amountInLong = amount.setScale(0, RoundingMode.HALF_UP).longValueExact();

            String paymentUrl = createPaymentUrl(
                    savedTransaction.getDealerTransactionId().toString(),
                    invoiceId.toString(),
                    amountInLong,
                    returnUrl,
                    ipAddr
            );

            log.info("Created VNPAY transaction for dealer invoice - InvoiceId: {}, TransactionId: {}", invoiceId, savedTransaction.getDealerTransactionId());
            return paymentUrl;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error initiating dealer invoice payment via VNPAY - InvoiceId: {}, Error: {}", invoiceId, e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Tạo URL thanh toán VNPAY theo đúng logic cũ từ PaymentService
     */
    private String createPaymentUrl(String transactionId, String orderId, Long amount, String returnUrl, String ipAddr) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnpayConfig.getVnpVersion());
        params.put("vnp_Command", vnpayConfig.getVnpCommand());
        params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100)); // nhân 100
        params.put("vnp_CurrCode", vnpayConfig.getVnpCurrCode());
        params.put("vnp_TxnRef", transactionId);
        params.put("vnp_OrderInfo", "ThanhToanDonHang_" + orderId);
        params.put("vnp_OrderType", vnpayConfig.getVnpOrderType());

        // Sử dụng returnUrl từ request
        String returnUrlToUse = (returnUrl != null && !returnUrl.trim().isEmpty())
                ? returnUrl
                : vnpayConfig.getVnpReturnUrl();
        params.put("vnp_ReturnUrl", returnUrlToUse);

        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_Locale", vnpayConfig.getVnpLocale());

        // Tạo query string và hash data
        String queryString = buildQueryString(params, false); // false = for URL
        String hashData = buildQueryString(params, true);     // true = for hash

        // Tạo vnp_SecureHash
        String vnp_SecureHash = hmacSHA512(vnpayConfig.getHashSecret(), hashData);

        // Tạo URL cuối cùng
        String finalUrl = vnpayConfig.getVnpUrl() + "?" + queryString
                + "&vnp_SecureHash=" + vnp_SecureHash;

        // Log debug
        log.info(">>> VNPAY Params: {}", params);
        log.info(">>> VNPAY Hash Data String: {}", hashData);
        log.info(">>> VNPAY Query String: {}", queryString);
        log.info(">>> VNPAY Generated vnp_SecureHash: {}", vnp_SecureHash);
        log.info(">>> VNPAY Client IP: {}", ipAddr);
        log.info(">>> VNPAY Return URL: {}", returnUrlToUse);

        return finalUrl;
    }

    /**
     * Xây dựng query string - Copy nguyên từ PaymentService.java
     * @param forHash: true = cho hash data, false = cho URL
     */
    private String buildQueryString(Map<String, String> params, boolean forHash) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder sb = new StringBuilder();
        for (String key : keys) {
            String value = params.get(key);
            if (value != null && !value.isEmpty()) {
                if (sb.length() > 0) {
                    sb.append("&");
                }

                if (forHash) {
                    // Cho hash data: chỉ encode vnp_ReturnUrl
                    if ("vnp_ReturnUrl".equals(key)) {
                        sb.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                    } else {
                        sb.append(key).append("=").append(value);
                    }
                } else {
                    // Cho URL: encode tất cả values
                    sb.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                }
            }
        }
        return sb.toString();
    }

    /**
     * HMAC-SHA512 - Copy nguyên từ PaymentService.java
     */
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
            log.error("Error calculating HMAC - Error: {}", e.getMessage(), e);
            throw new RuntimeException("Error calculating HMAC", e);
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
            if (!verifyVnpayHash(vnpParams)) {
                log.error("VNPAY IPN callback - Invalid checksum - TransactionId: {}", vnpTxnRef);
                return null;
            }

            // Parse transaction ID
            UUID transactionId = UUID.fromString(vnpTxnRef);

            Optional<Transaction> paymentTransaction = transactionRepository.findById(transactionId);
            if (paymentTransaction.isPresent()) {
                return handleCustomerGatewayCallback(paymentTransaction.get(), vnpResponseCode, vnpTransactionStatus, vnpTransactionNo);
            }

            Optional<DealerTransaction> dealerTransaction = dealerTransactionRepository.findById(transactionId);
            if (dealerTransaction.isPresent()) {
                return handleDealerGatewayCallback(dealerTransaction.get(), vnpResponseCode, vnpTransactionStatus, vnpTxnRef, vnpTransactionNo);
            }

            log.error("VNPAY IPN callback - Transaction not found anywhere - TransactionId: {}", vnpTxnRef);
            return null;

        } catch (Exception e) {
            log.error("Error processing VNPAY IPN callback - Error: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    @Transactional
    public UUID processReturnResult(Map<String, String> vnpParams) {
        try {
            String vnpResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnpTransactionStatus = vnpParams.get("vnp_TransactionStatus");
            String vnpTxnRef = vnpParams.get("vnp_TxnRef");
            String vnpTransactionNo = vnpParams.get("vnp_TransactionNo");

            if (vnpTxnRef == null) {
                log.error("VNPAY Return callback - Missing transaction reference");
                return null;
            }

            UUID transactionId = UUID.fromString(vnpTxnRef);

            Optional<Transaction> customerTransaction = transactionRepository.findById(transactionId);
            if (customerTransaction.isPresent()) {
                return handleCustomerReturnCallback(customerTransaction.get(), vnpResponseCode, vnpTransactionStatus, vnpTransactionNo);
            }

            Optional<DealerTransaction> dealerTransaction = dealerTransactionRepository.findById(transactionId);
            if (dealerTransaction.isPresent()) {
                return handleDealerReturnCallback(dealerTransaction.get(), vnpResponseCode, vnpTransactionStatus, vnpTransactionNo);
            }

            log.warn("VNPAY Return callback - Transaction not found for id {}", transactionId);
            return null;
        } catch (Exception e) {
            log.error("Error processing VNPAY return callback - Error: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public boolean validateChecksum(Map<String, String> vnpParams, String vnpSecureHash) {
        return verifyVnpayHash(vnpParams);
    }

    private UUID handleCustomerGatewayCallback(Transaction transaction,
                                               String responseCode,
                                               String transactionStatus,
                                               String vnpTransactionNo) {
        UUID transactionId = transaction.getTransactionId();

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.warn("VNPAY IPN callback - Customer transaction already processed - TransactionId: {}", transactionId);
            return transactionId;
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            transaction.setStatus("SUCCESS");
            transaction.setGatewayTransactionId(vnpTransactionNo);
            transactionRepository.save(transaction);

            log.info("VNPAY IPN callback - Customer payment successful - TransactionId: {}, VNPAY TransactionNo: {}",
                    transactionId, vnpTransactionNo);

            try {
                PaymentRecord paymentRecord = transaction.getPaymentRecord();
                if (paymentRecord != null) {
                    BigDecimal currentPaid = paymentRecord.getAmountPaid() != null ? paymentRecord.getAmountPaid() : BigDecimal.ZERO;
                    BigDecimal currentRemaining = paymentRecord.getRemainingAmount() != null
                            ? paymentRecord.getRemainingAmount()
                            : paymentRecord.getTotalAmount().subtract(currentPaid);

                    BigDecimal newPaid = currentPaid.add(transaction.getAmount());
                    BigDecimal newRemaining = currentRemaining.subtract(transaction.getAmount());

                    paymentRecord.setAmountPaid(newPaid);
                    paymentRecord.setRemainingAmount(newRemaining);

                    if (newRemaining.compareTo(BigDecimal.ZERO) <= 0) {
                        paymentRecord.setStatus("PAID");
                    } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
                        paymentRecord.setStatus("PARTIALLY_PAID");
                    }

                    paymentRecordRepository.save(paymentRecord);
                    log.info("VNPAY IPN callback - PaymentRecord updated - RecordId: {}, Status: {}",
                            paymentRecord.getRecordId(), paymentRecord.getStatus());
                }
            } catch (Exception e) {
                log.error("VNPAY IPN callback - Error updating PaymentRecord - TransactionId: {}, Error: {}",
                        transactionId, e.getMessage(), e);
            }

            return transactionId;
        }

        transaction.setStatus("FAILED");
        transaction.setGatewayTransactionId(vnpTransactionNo);
        transactionRepository.save(transaction);

        log.warn("VNPAY IPN callback - Customer payment failed - TransactionId: {}, ResponseCode: {}, TransactionStatus: {}",
                transactionId, responseCode, transactionStatus);
        return null;
    }

    private UUID handleCustomerReturnCallback(Transaction transaction,
                                              String responseCode,
                                              String transactionStatus,
                                              String vnpTransactionNo) {
        UUID transactionId = transaction.getTransactionId();

        boolean isPaymentSuccess = "00".equals(responseCode) && "00".equals(transactionStatus);

        if (isPaymentSuccess) {
            if (!"PENDING".equals(transaction.getStatus())) {
                transaction.setStatus("PENDING");
            }
            log.info("VNPAY Return callback - Customer payment pending confirmation - TransactionId: {}", transactionId);
        } else {
            transaction.setStatus("FAILED");
            log.warn("VNPAY Return callback - Customer payment failed - TransactionId: {}, ResponseCode: {}, TransactionStatus: {}",
                    transactionId, responseCode, transactionStatus);
        }

        transaction.setGatewayTransactionId(vnpTransactionNo);
        transactionRepository.save(transaction);
        return transactionId;
    }

    private UUID handleDealerGatewayCallback(DealerTransaction transaction,
                                             String responseCode,
                                             String transactionStatus,
                                             String transactionRef,
                                             String vnpTransactionNo) {
        UUID transactionId = transaction.getDealerTransactionId();

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.warn("VNPAY IPN callback - Dealer transaction already processed - TransactionId: {}", transactionId);
            return transactionId;
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            transaction.setStatus("SUCCESS");
            transaction.setTransactionCode(vnpTransactionNo);
            dealerTransactionRepository.save(transaction);

            DealerInvoice invoice = transaction.getDealerInvoice();
            if (invoice != null) {
                BigDecimal currentPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
                BigDecimal newAmountPaid = currentPaid.add(transaction.getAmount());
                invoice.setAmountPaid(newAmountPaid);

                if (newAmountPaid.compareTo(invoice.getTotalAmount()) >= 0) {
                    invoice.setStatus("PAID");
                } else if (newAmountPaid.compareTo(BigDecimal.ZERO) > 0) {
                    invoice.setStatus(invoice.getDueDate().isBefore(LocalDate.now()) ? "OVERDUE" : "PARTIALLY_PAID");
                }

                dealerInvoiceRepository.save(invoice);
                updateDealerDebtRecord(invoice.getDealerId(), transaction.getAmount());
            }

            log.info("VNPAY IPN callback - Dealer payment successful - TransactionId: {}, InvoiceId: {}",
                    transactionId, transaction.getDealerInvoice() != null ? transaction.getDealerInvoice().getDealerInvoiceId() : null);
            return transactionId;
        }

        transaction.setStatus("FAILED");
        transaction.setTransactionCode(vnpTransactionNo);
        dealerTransactionRepository.save(transaction);

        log.warn("VNPAY IPN callback - Dealer payment failed - TransactionId: {}, ResponseCode: {}, TransactionStatus: {}",
                transactionRef, responseCode, transactionStatus);
        return null;
    }

    private UUID handleDealerReturnCallback(DealerTransaction transaction,
                                            String responseCode,
                                            String transactionStatus,
                                            String vnpTransactionNo) {
        UUID transactionId = transaction.getDealerTransactionId();

        if ("PENDING_CONFIRMATION".equals(transaction.getStatus()) || "FAILED".equals(transaction.getStatus())) {
            log.warn("VNPAY Return callback - Dealer transaction already processed via return - TransactionId: {}", transactionId);
            return transactionId;
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            transaction.setStatus("PENDING_CONFIRMATION");
        } else {
            transaction.setStatus("FAILED");
        }

        transaction.setTransactionCode(vnpTransactionNo);
        dealerTransactionRepository.save(transaction);

        log.info("VNPAY Return callback - Dealer transaction updated - TransactionId: {}, Status: {}",
                transactionId, transaction.getStatus());
        return transactionId;
    }

    private void updateDealerDebtRecord(UUID dealerId, BigDecimal amountToAddToPaid) {
        if (dealerId == null || amountToAddToPaid == null || amountToAddToPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        DealerDebtRecord debtRecord = dealerDebtRecordRepository.findById(dealerId)
                .orElse(DealerDebtRecord.builder()
                        .dealerId(dealerId)
                        .totalOwed(BigDecimal.ZERO)
                        .totalPaid(BigDecimal.ZERO)
                        .build());

        debtRecord.setTotalPaid(debtRecord.getTotalPaid().add(amountToAddToPaid));
        dealerDebtRecordRepository.save(debtRecord);
    }

    /**
     * Verify chữ ký callback từ VNPAY - Copy nguyên từ PaymentService.java
     */
    @Override
    public boolean verifyVnpayHash(Map<String, String> params) {
        String vnp_SecureHash = params.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
            log.error(">>> [Verify] vnp_SecureHash is missing");
            return false;
        }

        Map<String, String> data = new HashMap<>(params);
        data.remove("vnp_SecureHash");
        data.remove("vnp_SecureHashType");

        // Xây dựng hash data string (giống khi tạo URL)
        List<String> keys = new ArrayList<>(data.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        for (String key : keys) {
            String value = data.get(key);
            if (value != null && !value.isEmpty()) {
                if (hashData.length() > 0) {
                    hashData.append("&");
                }
                // Chỉ encode vnp_ReturnUrl khi verify hash
                if ("vnp_ReturnUrl".equals(key)) {
                    hashData.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                } else {
                    hashData.append(key).append("=").append(value);
                }
            }
        }

        String hashDataStr = hashData.toString();
        String checkHash = hmacSHA512(vnpayConfig.getHashSecret(), hashDataStr);

        log.info(">>> [Verify] HashDataStr: {}", hashDataStr);
        log.info(">>> [Verify] Received vnp_SecureHash: {}", vnp_SecureHash);
        log.info(">>> [Verify] Calculated vnp_SecureHash: {}", checkHash);
        log.info(">>> [Verify] Hash match: {}", checkHash.equalsIgnoreCase(vnp_SecureHash));

        return checkHash.equalsIgnoreCase(vnp_SecureHash);
    }
}
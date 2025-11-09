package com.ev.payment_service.service.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.payment_service.dto.external.SalesOrderData;
import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
import com.ev.payment_service.dto.response.TransactionResponse;
import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.entity.Transaction;
import com.ev.payment_service.mapper.TransactionMapper;
import com.ev.payment_service.repository.PaymentMethodRepository;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.repository.TransactionRepository;
import com.ev.payment_service.service.Interface.ICustomerPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerPaymentServiceImpl implements ICustomerPaymentService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final TransactionRepository transactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionMapper transactionMapper;

    // === DYNAMIC CALL (SỬ DỤNG RestTemplate) ===
    private final RestTemplate restTemplate;

    @Value("${sales-service.url}") // Lấy URL từ application.properties
    private String salesServiceUrl;

    @Override
    @Transactional
    public InitiatePaymentResponse initiatePayment(UUID orderId, InitiatePaymentRequest request, String userEmail, UUID userProfileId) {

        // 1. GỌI API ĐỘNG: Lấy thông tin đơn hàng từ sales-service
        log.info("Calling sales-service for orderId: {}", orderId);

        // Cấu hình URL "động"
        String url = salesServiceUrl + "/sales-orders/" + orderId;
        SalesOrderData orderData;

        try {
            // Sales-service trả về ApiRespond<SalesOrderDto>, parse response dạng Map
            ParameterizedTypeReference<ApiRespond<Map<String, Object>>> responseType =
                    new ParameterizedTypeReference<ApiRespond<Map<String, Object>>>() {};
            
            ResponseEntity<ApiRespond<Map<String, Object>>> response = 
                    restTemplate.exchange(url, HttpMethod.GET, null, responseType);
            
            ApiRespond<Map<String, Object>> apiResponse = response.getBody();
            if (apiResponse == null || apiResponse.getData() == null) {
                log.error("Failed to fetch order details: Response or data is null");
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
            }
            
            // Map Map<String, Object> sang SalesOrderData
            Map<String, Object> salesOrderMap = apiResponse.getData();
            orderData = mapToSalesOrderData(salesOrderMap);
            
        } catch (RestClientException e) {
            log.error("Failed to fetch order details from sales-service at {}: {}", url, e.getMessage());
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        // (Từ Bước 2 -> 6: Logic giữ nguyên y hệt kế hoạch trước)

        // 2. Kiểm tra totalAmount của đơn hàng
        if (orderData.getTotalAmount() == null || orderData.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid totalAmount in order - OrderId: {}, TotalAmount: {}", 
                    orderId, orderData.getTotalAmount());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // 3. Lấy (hoặc tạo mới) Sổ thanh toán (PaymentRecord)
        log.info("Finding or creating PaymentRecord for orderId: {}", orderId);
        PaymentRecord record = paymentRecordRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    log.info("PaymentRecord not found, creating new one for orderId: {}", orderId);
                    return createNewPaymentRecord(orderData);
                });
        
        // Cập nhật totalAmount nếu SalesOrder có totalAmount khác (đồng bộ với SalesOrder)
        BigDecimal salesOrderTotalAmount = orderData.getTotalAmount();
        if (salesOrderTotalAmount != null && 
            (record.getTotalAmount() == null || record.getTotalAmount().compareTo(salesOrderTotalAmount) != 0)) {
            log.info("Updating PaymentRecord totalAmount - RecordId: {}, Old TotalAmount: {}, New TotalAmount: {}", 
                    record.getRecordId(), record.getTotalAmount(), salesOrderTotalAmount);
            
            // Tính lại remainingAmount dựa trên totalAmount mới và amountPaid hiện tại
            BigDecimal currentAmountPaid = record.getAmountPaid() != null ? record.getAmountPaid() : BigDecimal.ZERO;
            BigDecimal newRemainingAmount = salesOrderTotalAmount.subtract(currentAmountPaid);
            
            record.setTotalAmount(salesOrderTotalAmount);
            record.setRemainingAmount(newRemainingAmount);
            
            // Cập nhật status nếu cần
            if (newRemainingAmount.compareTo(BigDecimal.ZERO) <= 0 && !"PAID".equals(record.getStatus())) {
                record.setStatus("PAID");
            } else if (newRemainingAmount.compareTo(BigDecimal.ZERO) > 0 && 
                      salesOrderTotalAmount.compareTo(currentAmountPaid) > 0 && 
                      "PAID".equals(record.getStatus())) {
                record.setStatus("PARTIALLY_PAID");
            }
            
            record = paymentRecordRepository.save(record);
            log.info("PaymentRecord updated - RecordId: {}, TotalAmount: {}, AmountPaid: {}, RemainingAmount: {}, Status: {}", 
                    record.getRecordId(), record.getTotalAmount(), record.getAmountPaid(), 
                    record.getRemainingAmount(), record.getStatus());
        }
        
        log.info("PaymentRecord found/created - RecordId: {}, OrderId: {}, TotalAmount: {}, RemainingAmount: {}", 
                record.getRecordId(), record.getOrderId(), record.getTotalAmount(), record.getRemainingAmount());

        // 4. Xác thực số tiền
        BigDecimal remainingAmount = record.getRemainingAmount();
        log.info("Validating amount - Request Amount: {}, Remaining Amount: {}", request.getAmount(), remainingAmount);
        
        // Kiểm tra số tiền phải > 0
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Amount validation failed - Request amount must be greater than 0, got: {}", request.getAmount());
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        // Kiểm tra số tiền không được vượt quá số tiền còn lại
        if (request.getAmount().compareTo(remainingAmount) > 0) {
            log.error("Amount validation failed - Request amount {} is greater than remaining amount {}", 
                    request.getAmount(), remainingAmount);
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        // Kiểm tra PaymentRecord không được đã thanh toán đầy đủ
        if ("PAID".equals(record.getStatus())) {
            log.error("PaymentRecord is already PAID - RecordId: {}, OrderId: {}", record.getRecordId(), orderId);
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 5. Lấy PTTT
        log.info("Finding PaymentMethod with id: {}", request.getPaymentMethodId());
        PaymentMethod method = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> {
                    log.error("PaymentMethod not found with id: {}", request.getPaymentMethodId());
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });
        log.info("PaymentMethod found - MethodId: {}, MethodName: {}, MethodType: {}", 
                method.getMethodId(), method.getMethodName(), method.getMethodType());

        // 6. Tạo Giao dịch (Transaction)
        log.info("Creating Transaction - OrderId: {}, Amount: {}, PaymentMethodId: {}", 
                orderId, request.getAmount(), request.getPaymentMethodId());
        Transaction transaction = Transaction.builder()
                .paymentRecord(record)
                .paymentMethod(method)
                .amount(request.getAmount())
                .status("PENDING")
                .notes(request.getNotes())
                .build();
        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction created successfully - TransactionId: {}", savedTransaction.getTransactionId());

        // 7. Xử lý theo loại PTTT
        if (method.getMethodType() == com.ev.payment_service.enums.PaymentMethodType.MANUAL) {
            return InitiatePaymentResponse.builder()
                    .transactionId(savedTransaction.getTransactionId())
                    .status("PENDING_CONFIRMATION")
                    .message("Đã tạo yêu cầu thanh toán. Chờ đại lý xác nhận.")
                    .build();
        } else {
            // (Logic VNPAY)
            return InitiatePaymentResponse.builder()
                    .transactionId(savedTransaction.getTransactionId())
                    .status("PENDING_GATEWAY")
                    .paymentUrl("https://sandbox.vnpayment.vn/...") // (URL giả lập)
                    .message("Đang chuyển đến cổng thanh toán...")
                    .build();
        }
    }

    /**
     * Map Map<String, Object> từ sales-service response sang SalesOrderData
     */
    private SalesOrderData mapToSalesOrderData(Map<String, Object> salesOrderMap) {
        SalesOrderData data = new SalesOrderData();
        
        // Parse orderId
        if (salesOrderMap.get("orderId") != null) {
            try {
                Object orderIdObj = salesOrderMap.get("orderId");
                if (orderIdObj instanceof UUID) {
                    data.setOrderId((UUID) orderIdObj);
                } else {
                    String orderIdStr = orderIdObj.toString();
                    data.setOrderId(UUID.fromString(orderIdStr));
                }
            } catch (Exception e) {
                log.error("Failed to parse orderId - Value: {}, Error: {}", 
                        salesOrderMap.get("orderId"), e.getMessage());
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        } else {
            log.error("orderId is null in sales order response");
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        // Parse totalAmount
        if (salesOrderMap.get("totalAmount") != null) {
            Object totalAmountObj = salesOrderMap.get("totalAmount");
            try {
                if (totalAmountObj instanceof Number) {
                    data.setTotalAmount(BigDecimal.valueOf(((Number) totalAmountObj).doubleValue()));
                } else if (totalAmountObj instanceof String) {
                    data.setTotalAmount(new BigDecimal((String) totalAmountObj));
                } else {
                    log.warn("Cannot parse totalAmount - OrderId: {}, Type: {}", 
                            data.getOrderId(), totalAmountObj.getClass().getName());
                    data.setTotalAmount(BigDecimal.ZERO);
                }
            } catch (Exception e) {
                log.error("Failed to parse totalAmount - OrderId: {}, Error: {}", 
                        data.getOrderId(), e.getMessage());
                data.setTotalAmount(BigDecimal.ZERO);
            }
        } else {
            log.warn("totalAmount is null in sales order - OrderId: {}", data.getOrderId());
            data.setTotalAmount(BigDecimal.ZERO);
        }
        
        // Parse customerId (Long) từ SalesOrder hoặc quotation
        // SalesOrder.customerId bây giờ đã là Long (bigint), không phải UUID nữa
        data.setCustomerId(null);
        
        // Ưu tiên lấy customerId từ SalesOrder trước (đã là Long)
        if (salesOrderMap.get("customerId") != null) {
            try {
                Object customerIdObj = salesOrderMap.get("customerId");
                if (customerIdObj instanceof Number) {
                    data.setCustomerId(((Number) customerIdObj).longValue());
                    log.info("Found customerId from SalesOrder - OrderId: {}, CustomerId: {}", 
                            data.getOrderId(), data.getCustomerId());
                } else {
                    log.warn("CustomerId from SalesOrder is not a Number - OrderId: {}, Type: {}", 
                            data.getOrderId(), customerIdObj != null ? customerIdObj.getClass().getName() : "null");
                }
            } catch (Exception e) {
                log.warn("Failed to parse customerId from SalesOrder - OrderId: {}, Error: {}", 
                        data.getOrderId(), e.getMessage());
            }
        }
        
        // Nếu không có từ SalesOrder, thử lấy từ quotation (fallback)
        if (data.getCustomerId() == null && salesOrderMap.get("quotation") != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> quotationMap = (Map<String, Object>) salesOrderMap.get("quotation");
                if (quotationMap.get("customerId") != null) {
                    Object customerIdObj = quotationMap.get("customerId");
                    if (customerIdObj instanceof Number) {
                        data.setCustomerId(((Number) customerIdObj).longValue());
                        log.info("Found customerId from quotation (fallback) - OrderId: {}, CustomerId: {}", 
                                data.getOrderId(), data.getCustomerId());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse customerId from quotation - OrderId: {}, Error: {}", 
                        data.getOrderId(), e.getMessage());
            }
        }
        
        // Nếu vẫn không có, log warning (có thể là B2B order)
        if (data.getCustomerId() == null) {
            log.warn("CustomerId is null for OrderId: {} (may be a B2B order)", data.getOrderId());
        }
        
        // Parse orderStatus
        if (salesOrderMap.get("orderStatus") != null) {
            Object orderStatusObj = salesOrderMap.get("orderStatus");
            if (orderStatusObj instanceof Map) {
                // Nếu là enum object, lấy name
                @SuppressWarnings("unchecked")
                Map<String, Object> statusMap = (Map<String, Object>) orderStatusObj;
                data.setOrderStatusB2C(statusMap.get("name") != null ? statusMap.get("name").toString() : "UNKNOWN");
            } else {
                data.setOrderStatusB2C(orderStatusObj.toString());
            }
        } else {
            data.setOrderStatusB2C("UNKNOWN");
        }
        
        return data;
    }

    private PaymentRecord createNewPaymentRecord(SalesOrderData orderData) {
        BigDecimal totalAmount = orderData.getTotalAmount() != null ? orderData.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal amountPaid = BigDecimal.ZERO;
        BigDecimal remainingAmount = totalAmount.subtract(amountPaid);
        
        PaymentRecord newRecord = PaymentRecord.builder()
                .orderId(orderData.getOrderId())
                .customerId(orderData.getCustomerId()) // Có thể null nếu không tìm thấy
                .totalAmount(totalAmount)
                .amountPaid(amountPaid)
                .remainingAmount(remainingAmount) // Set explicitly
                .status("PENDING")
                .build();
        
        log.info("Creating new PaymentRecord - OrderId: {}, TotalAmount: {}, RemainingAmount: {}, CustomerId: {}", 
                orderData.getOrderId(), totalAmount, remainingAmount, orderData.getCustomerId());
        
        return paymentRecordRepository.save(newRecord);
    }

    @Override
    @Transactional
    public TransactionResponse confirmManualPayment(UUID transactionId, String userEmail, UUID userProfileId) {
        log.info("Confirming manual payment - TransactionId: {}, UserEmail: {}", transactionId, userEmail);

        // 1. Tìm giao dịch
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> {
                    log.error("Transaction not found with id: {}", transactionId);
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });

        // 2. Kiểm tra trạng thái giao dịch
        if (!"PENDING".equals(transaction.getStatus())) {
            log.error("Transaction is not in PENDING status - TransactionId: {}, Status: {}", 
                    transactionId, transaction.getStatus());
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 3. Kiểm tra phương thức thanh toán phải là MANUAL
        if (transaction.getPaymentMethod() == null || 
            transaction.getPaymentMethod().getMethodType() != com.ev.payment_service.enums.PaymentMethodType.MANUAL) {
            log.error("Transaction payment method is not MANUAL - TransactionId: {}, MethodType: {}", 
                    transactionId, 
                    transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().getMethodType() : "NULL");
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 4. Kiểm tra PaymentRecord không được đã thanh toán đầy đủ
        PaymentRecord record = transaction.getPaymentRecord();
        if ("PAID".equals(record.getStatus())) {
            log.error("PaymentRecord is already PAID - RecordId: {}, OrderId: {}", 
                    record.getRecordId(), record.getOrderId());
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 5. Cập nhật Transaction
        transaction.setStatus("SUCCESS");
        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction updated to SUCCESS - TransactionId: {}", transactionId);

        // 6. Cập nhật PaymentRecord
        BigDecimal newAmountPaid = record.getAmountPaid().add(transaction.getAmount());
        record.setAmountPaid(newAmountPaid);
        
        // Tính remainingAmount để kiểm tra status (remainingAmount sẽ được tính tự động bởi @PreUpdate khi save)
        BigDecimal calculatedRemainingAmount = record.getTotalAmount().subtract(newAmountPaid);
        
        if (calculatedRemainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            record.setStatus("PAID");
            log.info("PaymentRecord updated to PAID - RecordId: {}, OrderId: {}", 
                    record.getRecordId(), record.getOrderId());
        } else {
            record.setStatus("PARTIALLY_PAID");
            log.info("PaymentRecord updated to PARTIALLY_PAID - RecordId: {}, OrderId: {}, RemainingAmount: {}", 
                    record.getRecordId(), record.getOrderId(), calculatedRemainingAmount);
        }
        
        // Save sẽ trigger @PreUpdate để tự động tính remainingAmount
        PaymentRecord savedRecord = paymentRecordRepository.save(record);
        log.info("PaymentRecord saved - RecordId: {}, AmountPaid: {}, RemainingAmount: {}", 
                savedRecord.getRecordId(), savedRecord.getAmountPaid(), savedRecord.getRemainingAmount());

        // 7. GỌI API ĐỘNG (DÙNG RestTemplate): Cập nhật sales-service
        // Chỉ cập nhật khi thanh toán đầy đủ (sử dụng savedRecord để lấy status chính xác)
        if ("PAID".equals(savedRecord.getStatus())) {
            String url = salesServiceUrl + "/sales-orders/" + savedRecord.getOrderId() + "/status";
            Map<String, String> requestBody = Map.of("status", "CONFIRMED"); // (Giả sử sales-service chấp nhận body này)

            try {
                // Dùng PUT để cập nhật
                restTemplate.put(url, requestBody);
                log.info("Successfully updated order status in sales-service for orderId: {}", savedRecord.getOrderId());
            } catch (RestClientException e) {
                log.error("Failed to update order status in sales-service at {}: {}", url, e.getMessage(), e);
                // (Không ném lỗi ở đây, vì tiền đã được ghi nhận. Cần cơ chế retry/bù trừ)
                // TODO: Implement retry mechanism or event-driven update
            }
        } else {
            log.info("Payment not fully paid yet, skipping sales-service status update - OrderId: {}, RemainingAmount: {}", 
                    savedRecord.getOrderId(), savedRecord.getRemainingAmount());
        }

        return transactionMapper.toResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getPaymentHistory(UUID orderId) {
        // (Logic giữ nguyên)
        List<Transaction> transactions = transactionRepository.findByPaymentRecord_OrderId(orderId);
        return transactions.stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCustomerTotalDebt(Long customerId) {
        log.info("Calculating total debt for customer: {}", customerId);
        
        if (customerId == null) {
            log.warn("CustomerId is null, returning zero debt");
            return BigDecimal.ZERO;
        }
        
        // Lấy tất cả PaymentRecord của khách hàng
        List<PaymentRecord> records = paymentRecordRepository.findByCustomerId(customerId);
        
        if (records == null || records.isEmpty()) {
            log.info("No payment records found for customer: {}", customerId);
            return BigDecimal.ZERO;
        }
        
        // Tính tổng remainingAmount (công nợ còn lại)
        // Chỉ tính các record chưa thanh toán đầy đủ (status != PAID)
        BigDecimal totalDebt = records.stream()
                .filter(record -> record != null && 
                        record.getRemainingAmount() != null && 
                        !"PAID".equals(record.getStatus()) &&
                        record.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(PaymentRecord::getRemainingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        log.info("Total debt for customer {}: {} (from {} records)", customerId, totalDebt, records.size());
        return totalDebt;
    }
}
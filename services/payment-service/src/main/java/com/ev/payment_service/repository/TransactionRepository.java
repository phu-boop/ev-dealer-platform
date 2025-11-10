package com.ev.payment_service.repository;

import com.ev.payment_service.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Lấy tất cả giao dịch của một sổ thanh toán (PaymentRecord)
    List<Transaction> findByPaymentRecord_RecordId(UUID recordId);

    // Lấy tất cả giao dịch của một đơn hàng (Order)
    // (Query lồng qua PaymentRecord)
    List<Transaction> findByPaymentRecord_OrderId(UUID orderId);
}
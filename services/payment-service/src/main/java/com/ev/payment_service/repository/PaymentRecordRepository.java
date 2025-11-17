package com.ev.payment_service.repository;

import com.ev.payment_service.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, UUID> {

    // Tìm sổ thanh toán bằng Order ID (vì 1-1)
    Optional<PaymentRecord> findByOrderId(UUID orderId);

    // Tìm tất cả sổ thanh toán của một khách hàng
    List<PaymentRecord> findByCustomerId(UUID customerId);

    // Tìm các sổ thanh toán theo trạng thái (ví dụ: PENDING, OVERDUE)
    List<PaymentRecord> findByStatus(String status);
}
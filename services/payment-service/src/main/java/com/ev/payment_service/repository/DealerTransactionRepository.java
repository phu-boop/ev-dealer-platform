package com.ev.payment_service.repository;

import com.ev.payment_service.entity.DealerTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface DealerTransactionRepository extends JpaRepository<DealerTransaction, UUID> {

    // Lấy tất cả giao dịch của một hóa đơn
    List<DealerTransaction> findByDealerInvoice_DealerInvoiceId(UUID dealerInvoiceId);

    // Lấy danh sách giao dịch chờ duyệt (PENDING_CONFIRMATION) với payment method type = MANUAL
    @Query("SELECT dt FROM DealerTransaction dt " +
           "WHERE dt.status = 'PENDING_CONFIRMATION' " +
           "AND dt.paymentMethod.methodType = com.ev.payment_service.enums.PaymentMethodType.MANUAL " +
           "ORDER BY dt.transactionDate DESC")
    Page<DealerTransaction> findPendingManualTransactions(Pageable pageable);
}
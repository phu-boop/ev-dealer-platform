package com.ev.payment_service.repository;

import com.ev.payment_service.entity.DealerTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DealerTransactionRepository extends JpaRepository<DealerTransaction, UUID> {

    // Lấy tất cả giao dịch của một hóa đơn
    List<DealerTransaction> findByDealerInvoice_DealerInvoiceId(UUID dealerInvoiceId);
}
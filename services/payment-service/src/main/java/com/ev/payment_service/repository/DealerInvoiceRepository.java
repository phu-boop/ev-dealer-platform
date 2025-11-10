package com.ev.payment_service.repository;

import com.ev.payment_service.entity.DealerInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DealerInvoiceRepository extends JpaRepository<DealerInvoice, UUID> {

    // Lấy tất cả hóa đơn của một Đại lý
    List<DealerInvoice> findByDealerId(UUID dealerId);

    // Lấy các hóa đơn của Đại lý theo trạng thái
    List<DealerInvoice> findByDealerIdAndStatus(UUID dealerId, String status);

    // Lấy tất cả hóa đơn theo trạng thái (cho EVM Staff)
    List<DealerInvoice> findByStatus(String status);
}
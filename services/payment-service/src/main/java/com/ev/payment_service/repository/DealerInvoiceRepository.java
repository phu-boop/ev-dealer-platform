package com.ev.payment_service.repository;

import com.ev.payment_service.entity.DealerInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DealerInvoiceRepository extends JpaRepository<DealerInvoice, UUID> {

    // Lấy tất cả hóa đơn của một Đại lý (có phân trang)
    Page<DealerInvoice> findByDealerId(UUID dealerId, Pageable pageable);

    // Lấy các hóa đơn của Đại lý theo trạng thái (có phân trang)
    Page<DealerInvoice> findByDealerIdAndStatus(UUID dealerId, String status, Pageable pageable);

    // Lấy tất cả hóa đơn theo trạng thái (cho EVM Staff) - có phân trang
    Page<DealerInvoice> findByStatus(String status, Pageable pageable);
}
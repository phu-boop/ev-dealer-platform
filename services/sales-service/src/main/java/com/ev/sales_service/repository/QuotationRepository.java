package com.ev.sales_service.repository;

import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.enums.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID> {
    /**
     * Tìm tất cả báo giá cho một đại lý cụ thể
     * (Phục vụ EDMS-35)
     */
    List<Quotation> findByDealerId(UUID dealerId);

    /**
     * Tìm tất cả báo giá cho một đại lý THEO TRẠNG THÁI
     * (Phục vụ EDMS-35, để Manager lọc các báo giá PENDING)
     */
    List<Quotation> findByDealerIdAndStatus(UUID dealerId, QuotationStatus status);

    /**
     * Tìm báo giá theo ID của nhân viên
     * (Phục vụ Dealer Staff)
     */
    List<Quotation> findByStaffId(UUID staffId);
}
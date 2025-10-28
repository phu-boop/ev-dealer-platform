package com.ev.sales_service.repository;

import com.ev.sales_service.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID> {
    // Hiện tại, các hàm JpaRepository cơ bản (save, findById, findAll) đã đủ
    // Chúng ta sẽ thêm các hàm tùy chỉnh (custom queries) ở đây khi cần
}
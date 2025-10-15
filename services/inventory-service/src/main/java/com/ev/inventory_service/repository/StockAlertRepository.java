package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {
    // Tìm các cảnh báo chưa được xử lý cho một sản phẩm cụ thể
    List<StockAlert> findByVariantIdAndStatus(Long variantId, String status);

    List<StockAlert> findAllByStatus(String status);

    List<StockAlert> findByVariantIdAndDealerIdAndStatus(Long variantId, Long dealerId, String status);
}

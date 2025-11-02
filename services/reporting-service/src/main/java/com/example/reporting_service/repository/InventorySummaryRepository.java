package com.example.reporting_service.repository;

import com.example.reporting_service.model.InventorySummaryByRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

// Kế thừa JpaSpecificationExecutor để có thể query động theo region, modelId
public interface InventorySummaryRepository 
    extends JpaRepository<InventorySummaryByRegion, Integer>, JpaSpecificationExecutor<InventorySummaryByRegion> {

    /**
     * Thực hiện thao tác UPSERT (INSERT OR UPDATE) để cập nhật tồn kho.
     * Logic này giúp tổng hợp dữ liệu từ Kafka vào bảng riêng của service này.
     */
    
    @Modifying
    @Query(value = """
        INSERT INTO inventory_summary_by_region
            (model_id, model_name, variant_id, variant_name, region, total_stock)
        VALUES
            (:modelId, :modelName, :variantId, :variantName, :region, :stock)
        ON DUPLICATE KEY UPDATE
            model_name = VALUES(model_name),
            variant_name = VALUES(variant_name),
            total_stock = VALUES(total_stock),
            last_updated_at = CURRENT_TIMESTAMP
    """, nativeQuery = true)
    void upsertInventorySummary(
        String modelId, String modelName, 
        String variantId, String variantName, 
        String region, int stock
    );
}
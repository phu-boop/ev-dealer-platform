package com.example.reporting_service.controller;

import com.example.reporting_service.model.InventorySummaryByRegion;
import com.example.reporting_service.repository.InventorySummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reports") 
public class ReportController {

    @Autowired
    private InventorySummaryRepository inventoryRepository;

    /**
     * API: GET /reports/inventory
     * Phục vụ task: "xem tồn kho theo mẫu xe, phiên bản và khu vực" (Có thể filter)
     */
    @GetMapping("/inventory")
    public ResponseEntity<List<InventorySummaryByRegion>> getInventoryReport(
        @RequestParam(required = false) String region,
        @RequestParam(required = false) String modelId,
        @RequestParam(required = false) String variantId
    ) {
        // Khởi tạo Specification để xây dựng truy vấn động (filter theo tham số)
        Specification<InventorySummaryByRegion> spec = Specification.where(null);

        if (region != null && !region.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("region"), region));
        }
        if (modelId != null && !modelId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("modelId"), modelId));
        }
        if (variantId != null && !variantId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("variantId"), variantId));
        }

        // Truy vấn dữ liệu đã được tổng hợp (pre-aggregated)
        List<InventorySummaryByRegion> results = inventoryRepository.findAll(spec);
        
        return ResponseEntity.ok(results);
    }
}
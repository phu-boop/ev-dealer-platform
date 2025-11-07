package com.example.reporting_service.service;

import com.example.reporting_service.dto.EnrichedInventoryStockEvent;
import com.example.reporting_service.repository.InventorySummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryPersistenceService { // Lớp mới, chuyên trách Transaction DB

    @Autowired
    private InventorySummaryRepository inventoryRepository;

    /**
     * Phương thức được gọi từ KafkaConsumerService.
     * Transactional được đặt ở đây để BẮT BUỘC Spring kích hoạt Transaction và commit.
     */
    @Transactional
    public void saveInventorySummary(EnrichedInventoryStockEvent event) {
        
        // Thêm log để xác nhận Transaction đã được gọi
        System.out.println("LOGGING: Transactional save initiated for " + event.getModelId());

        inventoryRepository.upsertInventorySummary(
            event.getModelId(),
            event.getModelName(),
            event.getVariantId(),
            event.getVariantName(),
            event.getRegion(),
            event.getStockOnHand()
        );
    }
}
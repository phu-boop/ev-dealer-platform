package com.ev.ai_service.listener;

import com.ev.ai_service.entity.InventorySnapshot;
import com.ev.ai_service.entity.SalesHistory;
import com.ev.ai_service.repository.InventorySnapshotRepository;
import com.ev.ai_service.repository.SalesHistoryRepository;
import com.ev.common_lib.event.ProductUpdateEvent;
import com.ev.common_lib.event.DealerStockUpdatedEvent;
import com.ev.common_lib.model.InventoryTransactionEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsListener {
    
    private final SalesHistoryRepository salesHistoryRepository;
    private final InventorySnapshotRepository inventorySnapshotRepository;

    /**
     * Lắng nghe các sự kiện từ inventory-service.
     * Lưu sales history để dùng cho forecasting
     */
    @KafkaListener(topics = "inventory_events", groupId = "ai-inventory-group")
    public void handleInventoryEvent(InventoryTransactionEvent transaction) {
        
        log.info(">>> AI SERVICE: Received inventory transaction event");
        log.info("    Variant ID: {}", transaction.getVariantId());
        log.info("    Quantity: {}", transaction.getQuantity());
        log.info("    Transaction Type: {}", transaction.getTransactionType());

        try {
            // Nếu là SALE transaction, lưu vào sales history
            if (transaction.getTransactionType() != null && 
                transaction.getTransactionType().toString().equalsIgnoreCase("SALE")) {
                SalesHistory history = SalesHistory.builder()
                    .orderId(UUID.randomUUID()) // TODO: Get from actual order
                    .variantId(transaction.getVariantId())
                    .dealerId(UUID.randomUUID()) // TODO: Get from transaction
                    .region("Unknown") // TODO: Get region from dealer
                    .quantity(Math.abs(transaction.getQuantity()))
                    .totalAmount(null) // TODO: Get from order
                    .saleDate(LocalDateTime.now())
                    .recordedAt(LocalDateTime.now())
                    .orderStatus("COMPLETED")
                    .build();
                
                salesHistoryRepository.save(history);
                log.info("Saved sales history for variant {}", transaction.getVariantId());
            }
        } catch (Exception e) {
            log.error("Error processing inventory event: {}", e.getMessage(), e);
        }
    }

    /**
     * Lắng nghe các sự kiện từ vehicle-catalog-service.
     */
    @KafkaListener(topics = "product_events", groupId = "ai-product-group")
    public void handleProductUpdate(ProductUpdateEvent event) {
        log.info(">>> AI SERVICE: Received product update event");
        log.info("    Variant ID: {}", event.getVariantId());
        log.info("    New Price: {}", event.getNewPrice());

        // TODO: Update product information in data warehouse
    }

    /**
     * Lắng nghe sự kiện dealer stock updates
     * Lưu inventory snapshots để phân tích tốc độ tiêu thụ
     */
    @KafkaListener(topics = "stock_events_dealerEVM", groupId = "ai-analytics-group-v1")
    public void handleDealerStockUpdate(DealerStockUpdatedEvent event) {
        
        log.info(">>> AI SERVICE: Received dealer stock update event");
        log.info("    - Variant ID: {}", event.getVariantId());
        log.info("    - Model Name: {}", event.getModelName());
        log.info("    - Dealer ID: {}", event.getDealerId());
        log.info("    - New Available Quantity: {}", event.getNewAvailableQuantity());
        log.info("    - Last Updated: {}", event.getLastUpdatedAt());

        try {
            // Lưu inventory snapshot
            InventorySnapshot snapshot = InventorySnapshot.builder()
                .variantId(event.getVariantId())
                .dealerId(event.getDealerId())
                .region("Unknown") // TODO: Get region from dealer service
                .availableQuantity(event.getNewAvailableQuantity())
                .allocatedQuantity(0) // TODO: Get from event if available
                .snapshotDate(LocalDateTime.now())
                .modelName(event.getModelName())
                .variantName(event.getModelName())
                .build();
            
            inventorySnapshotRepository.save(snapshot);
            log.info("Saved inventory snapshot for variant {}", event.getVariantId());
        } catch (Exception e) {
            log.error("Error processing dealer stock update: {}", e.getMessage(), e);
        }
    }
}
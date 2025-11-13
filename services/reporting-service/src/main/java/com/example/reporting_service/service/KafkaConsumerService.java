package com.example.reporting_service.service;

import com.example.reporting_service.dto.EnrichedInventoryStockEvent;
import com.example.reporting_service.dto.SaleEventDTO;
import com.example.reporting_service.model.DealerCache;
import com.example.reporting_service.model.VehicleCache;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;

import com.ev.common_lib.event.DealerStockUpdatedEvent;
import com.ev.common_lib.event.OrderDeliveredEvent;
import java.sql.Timestamp;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final InventoryPersistenceService persistenceService;
    private final SalesPersistenceService salesPersistenceService;
    private final CacheService cacheService; // <-- BẮT BUỘC PHẢI INJECT CACHE
    private final ObjectMapper objectMapper;

    /**
     * Lắng nghe sự kiện TỒN KHO từ inventory-service
     *
     */
    @KafkaListener(topics = "stock_events_dealerEVM", groupId = "reporting-service-group")
    public void handleInventoryEvent(String message) {
        log.info("Nhận được chuỗi JSON (Tồn kho): " + message);

        try {
            // 1. Parse sang DTO GỐC (từ common-lib)
            DealerStockUpdatedEvent event = objectMapper.readValue(message, DealerStockUpdatedEvent.class);
            
            // 2. Tra cứu Cache (Lazy-loading)
            DealerCache dealer = cacheService.getDealerInfo(event.getDealerId());
            if (dealer == null) {
                log.error("Cache Miss (không tìm thấy) cho Dealer: {}. Đang thử lại...", event.getDealerId());
                throw new RuntimeException("Cache Miss cho Dealer (sẽ retry): " + event.getDealerId());
            }

            // 3. Xây dựng DTO nội bộ (Enriched)
            EnrichedInventoryStockEvent enrichedEvent = new EnrichedInventoryStockEvent();
            enrichedEvent.setRegion(dealer.getRegion());
            enrichedEvent.setDealerId(event.getDealerId());
            enrichedEvent.setModelId(event.getModelId());
            enrichedEvent.setModelName(event.getModelName());
            enrichedEvent.setVariantId(event.getVariantId());
            enrichedEvent.setVariantName(event.getVariantName());
            
            // 4. --- SỬA LỖI NULLPOINTER TẠI ĐÂY ---
            // Gán giá trị từ DTO gốc -> DTO nội bộ
            enrichedEvent.setStockOnHand(Long.valueOf(event.getNewAvailableQuantity()));
            
            // 5. GỌI LỚP PERSISTENCE
            persistenceService.saveInventorySummary(enrichedEvent);

            log.info("-> Đã cập nhật báo cáo tồn kho thành công cho: {}", event.getVariantName());

        } catch (Exception e) {
            log.error("LỖI GIAO DỊCH/LƯU MESSAGE (Tồn kho): " + e.getMessage());
            throw new RuntimeException("Failed to process Kafka message for DB save (Inventory).", e);
        }
    }

    /**
     * Lắng nghe sự kiện DOANH SỐ từ sales-service
     *
     */
    @KafkaListener(topics = "sales.orders.delivered", groupId = "reporting-service-group")
    public void handleSaleEvent(String message) {
        log.info("Nhận được chuỗi JSON (Doanh số): " + message);

        try {
            // 1. Parse sang DTO GỐC (từ common-lib)
            OrderDeliveredEvent event = objectMapper.readValue(message, OrderDeliveredEvent.class);
            
            // 2. Tra cứu Cache (Lazy-loading)
            DealerCache dealer = cacheService.getDealerInfo(event.getDealerId());
            if (dealer == null) {
                log.error("Cache Miss (không tìm thấy) cho Dealer: {}. Đang thử lại...", event.getDealerId());
                throw new RuntimeException("Cache Miss cho Dealer (sẽ retry): " + event.getDealerId());
            }

            // 3. Lặp qua TỪNG MẶT HÀNG trong đơn hàng (Rất quan trọng)
            for (OrderDeliveredEvent.OrderItemDetail item : event.getItems()) {
                
                // 4. Tra cứu cache cho Xe
                VehicleCache vehicle = cacheService.getVehicleInfo(item.getVariantId());
                if (vehicle == null) {
                    log.error("Cache Miss (không tìm thấy) cho Vehicle: {}. Bỏ qua item này.", item.getVariantId());
                    continue; // Bỏ qua item này, xử lý item tiếp theo
                }
                
                // 5. Xây dựng DTO nội bộ (SaleEventDTO)
                SaleEventDTO saleDto = new SaleEventDTO();
                saleDto.setRegion(dealer.getRegion());
                saleDto.setDealershipId(dealer.getDealerId());
                saleDto.setDealershipName(dealer.getDealerName());
                
                saleDto.setModelId(vehicle.getModelId());
                saleDto.setModelName(vehicle.getModelName());
                saleDto.setVariantId(vehicle.getVariantId());
                saleDto.setVariantName(vehicle.getVariantName());
                
                saleDto.setQuantitySold((long) item.getQuantity());
                saleDto.setSalePrice(item.getFinalPrice().doubleValue());
                saleDto.setSaleTimestamp(Timestamp.valueOf(event.getDeliveryDate()));

                // 6. GỌI LỚP PERSISTENCE (cho từng item)
                salesPersistenceService.saveSaleSummary(saleDto);
            }

            log.info("-> Đã cập nhật báo cáo doanh số thành công cho Order: {}", event.getOrderId());

        } catch (Exception e) {
            log.error("LỖI GIAO DỊCH/LƯU MESSAGE (Doanh số): " + e.getMessage());
            throw new RuntimeException("Failed to process Kafka message for DB save (Sales).", e);
        }
    }
}
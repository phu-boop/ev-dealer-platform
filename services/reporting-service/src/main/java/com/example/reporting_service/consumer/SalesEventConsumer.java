package com.example.reporting_service.consumer;

import com.example.reporting_service.dto.SaleEventDTO; // DTO này được dùng trong SalesPersistenceService
import com.example.reporting_service.model.DealerCache;
import com.example.reporting_service.model.VehicleCache;
import com.example.reporting_service.service.CacheService;
import com.example.reporting_service.service.SalesPersistenceService;
import com.ev.common_lib.event.OrderDeliveredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesEventConsumer {

    private final SalesPersistenceService persistenceService;
    private final CacheService cacheService;

    // Lắng nghe topic từ OutboxProcessor.java
    @KafkaListener(topics = "sales.orders.delivered", groupId = "reporting-service-group")
    public void handleOrderDelivered(OrderDeliveredEvent event) {
        log.info("Nhận sự kiện doanh số cho đơn hàng: {}", event.getOrderId());

        // 1. Tra cứu thông tin Đại lý (Lazy-loading)
        DealerCache dealer = cacheService.getDealerInfo(event.getDealerId());
        if (dealer == null) {
            log.error("Không thể xử lý doanh số, thiếu thông tin Dealer: {}", event.getDealerId());
            return; // Hoặc gửi vào Dead Letter Queue
        }

        // 2. Lặp qua từng item trong đơn hàng
        for (OrderDeliveredEvent.OrderItemDetail item : event.getItems()) {
            
            // 3. Tra cứu thông tin Xe (Lazy-loading)
            VehicleCache vehicle = cacheService.getVehicleInfo(item.getVariantId());
            if (vehicle == null) {
                log.error("Không thể xử lý doanh số, thiếu thông tin Vehicle: {}", item.getVariantId());
                continue;
            }

            // 4. Xây dựng DTO cho PersistenceService (theo file SalesPersistenceService.java)
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

            // 5. Gọi service persistence của bạn để lưu vào DB
            try {
                persistenceService.saveSaleSummary(saleDto);
            } catch (Exception e) {
                log.error("Lỗi khi lưu báo cáo doanh số: {}", e.getMessage(), e);
                // Xử lý retry hoặc DLQ
            }
        }
    }
}

package com.example.reporting_service.service;

import com.example.reporting_service.dto.EnrichedInventoryStockEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class KafkaConsumerService {

    @Autowired
    private InventoryPersistenceService persistenceService;

    private final ObjectMapper mapper = new ObjectMapper();

    @KafkaListener(topics = "stock_events_final_v2", groupId = "reporting-service-group", containerFactory = "kafkaListenerContainerFactory")
    public void handleInventoryEvent(String message) {
        
        System.out.println("Nhận được chuỗi JSON từ Kafka: " + message);

        try {
            EnrichedInventoryStockEvent event = mapper.readValue(message, EnrichedInventoryStockEvent.class);
            
            System.out.println("-> Đã parse thành công: " + event.getVariantName() 
                               + " | Tồn mới: " + event.getStockOnHand());

            // GỌI PHƯƠNG THỨC TRANSACTIONAL TỪ LỚP KHÁC
            persistenceService.saveInventorySummary(event);

            // LOGGING CUỐI CÙNG SAU KHI TRANSACTION NÊN ĐƯỢC COMMIT
            System.out.println("-> Đã cập nhật báo cáo tồn kho thành công.");

        } catch (Exception e) {
            // HÀNH ĐỘNG: In ra lỗi để debug vấn đề COMMIT/ROLLBACK
            System.err.println("LỖI GIAO DỊCH/LƯU MESSAGE CUỐI CÙNG: " + e.getMessage());

            // Ném lại RuntimeException để Spring Kafka rollback cả Kafka commit và retry.
            throw new RuntimeException("Failed to process Kafka message for DB save.", e);
        }
    }
}
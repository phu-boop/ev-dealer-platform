package com.ev.sales_service.Listener;

import com.ev.common_lib.event.B2BOrderPlacedEvent;
import com.ev.common_lib.event.OrderIssueReportedEvent;
import com.ev.sales_service.dto.response.NotificationDto;
import com.ev.sales_service.entity.Notification; // <-- IMPORT
import com.ev.sales_service.enums.NotificationAudience; // <-- IMPORT
import com.ev.sales_service.repository.NotificationRepository; // <-- IMPORT
import com.ev.sales_service.mapper.NotificationMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationKafkaListener {

    // Dùng để đẩy tin nhắn qua WebSocket
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    private static final String STAFF_TOPIC = "/topic/staff-notifications";
    
    /**
     * Lắng nghe sự kiện "Báo cáo sự cố" và đẩy cho Hãng (EVM Staff)
     */
    @KafkaListener(topics = "sales.orders.issue_reported", 
                   groupId = "${spring.kafka.consumer.group-id}")
    public void handleIssueReported(String payload) {
        log.info("Kafka Listener: Nhận được sự kiện Báo Cáo Sự Cố...");
        try {
            OrderIssueReportedEvent event = objectMapper.readValue(payload, OrderIssueReportedEvent.class);

            String message = String.format(
                "Đại lý (Email: %s) vừa báo cáo sự cố cho Đơn hàng ...%s: %s",
                event.getReportedByEmail(),
                event.getOrderId().toString().substring(28),
                event.getReason()
            );
            
            Notification notificationEntity = Notification.builder()
                .type("ORDER_DISPUTED")
                .message(message)
                .link("/evm/b2b-orders/" + event.getOrderId()) // Link để xử lý
                .audience(NotificationAudience.STAFF) // Thông báo cho Staff
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
            
            Notification savedNotification = notificationRepository.save(notificationEntity);
            log.info("Đã lưu thông báo sự cố ID {} vào CSDL.", savedNotification.getId());

            NotificationDto notificationDto = notificationMapper.toDto(savedNotification);

            messagingTemplate.convertAndSend(STAFF_TOPIC, notificationDto);
            log.info("Đã đẩy thông báo sự cố qua WebSocket.");
        
        } catch (Exception e) {
            log.error("Lỗi khi parse hoặc xử lý OrderIssueReportedEvent: {}", e.getMessage(), e);
        }
    }
            
    @KafkaListener(topics = "sales.orders.placed", 
                   groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderPlaced(String payload) {
        log.info("Kafka Listener: Nhận được Đơn hàng mới...");
        try {
            B2BOrderPlacedEvent event = objectMapper.readValue(payload, B2BOrderPlacedEvent.class);

            String message = String.format(
                "Đại lý (Email: %s) vừa tạo đơn hàng mới ...%s.",
                event.getPlacedByEmail(),
                event.getOrderId().toString().substring(28)
            );

            Notification notificationEntity = Notification.builder()
                .type("ORDER_PLACED")
                .message(message)
                .link("/evm/b2b-orders/" + event.getOrderId()) // Link để xem
                .audience(NotificationAudience.STAFF)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            Notification savedNotification = notificationRepository.save(notificationEntity);
            log.info("Đã lưu thông báo đơn hàng mới ID {} vào CSDL.", savedNotification.getId());

            NotificationDto notificationDto = notificationMapper.toDto(savedNotification);

            messagingTemplate.convertAndSend(STAFF_TOPIC, notificationDto);
            log.info("Đã đẩy thông báo đơn hàng mới qua WebSocket.");

        } catch (Exception e) {
            log.error("Lỗi khi parse hoặc xử lý B2BOrderPlacedEvent: {}", e.getMessage(), e);
        }
    }
}
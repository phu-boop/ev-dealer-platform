package com.ev.sales_service.Listener;

import com.ev.common_lib.event.B2BOrderPlacedEvent;
import com.ev.common_lib.event.OrderIssueReportedEvent;
import com.ev.common_lib.event.StockAlertEvent;
import com.ev.sales_service.dto.response.NotificationDto;
import com.ev.sales_service.entity.Notification;
import com.ev.sales_service.enums.NotificationAudience;
import com.ev.sales_service.repository.NotificationRepository;
import com.ev.sales_service.mapper.NotificationMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

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
    private static final String LOW_STOCK_TOPIC = "inventory.alerts.low_stock";

    /**
     * Lắng nghe sự kiện "Báo cáo sự cố" (ĐÃ SỬA)
     */
    @KafkaListener(topics = "sales.orders.issue_reported", groupId = "${spring.kafka.consumer.group-id}")
    public void handleIssueReported(String payload) {
        log.info("Kafka Listener: Nhận được sự kiện Báo Cáo Sự Cố...");
        try {
            OrderIssueReportedEvent event = objectMapper.readValue(payload, OrderIssueReportedEvent.class);

            // TÌM thông báo "thật" mà Service đã tạo
            String expectedLink = "/evm/b2b-orders/" + event.getOrderId().toString();
            String expectedType = "ORDER_DISPUTED";

            Optional<Notification> notificationOpt = notificationRepository.findByLinkAndType(expectedLink,
                    expectedType);

            if (notificationOpt.isEmpty()) {
                log.error("LỖI NGHIÊM TRỌNG: Kafka listener không tìm thấy notification cho KHIẾU NẠI: {}",
                        event.getOrderId());
                // (Không tìm thấy, có thể do lỗi timing hoặc logic)
                return; // Bỏ qua
            }

            // Lấy thông báo đã tồn tại
            Notification notificationEntity = notificationOpt.get();

            NotificationDto notificationDto = notificationMapper.toDto(notificationEntity);
            messagingTemplate.convertAndSend(STAFF_TOPIC, notificationDto);
            log.info("Đã đẩy thông báo sự cố (ID: {}) qua WebSocket.", notificationEntity.getId());

        } catch (Exception e) {
            log.error("Lỗi khi parse hoặc xử lý OrderIssueReportedEvent: {}", e.getMessage(), e);
        }
    }

    /**
     * Lắng nghe sự kiện "Đơn hàng mới" (ĐÃ SỬA)
     */
    @KafkaListener(topics = "sales.orders.placed", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderPlaced(String payload) {
        log.info("Kafka Listener: Nhận được Đơn hàng mới...");
        try {
            B2BOrderPlacedEvent event = objectMapper.readValue(payload, B2BOrderPlacedEvent.class);

            // TÌM thông báo "thật" mà Service đã tạo
            String expectedLink = "/evm/b2b-orders/" + event.getOrderId().toString();
            String expectedType = "ORDER_PLACED";

            Optional<Notification> notificationOpt = notificationRepository.findByLinkAndType(expectedLink,
                    expectedType);

            if (notificationOpt.isEmpty()) {
                log.error("LỖI NGHIÊM TRỌNG: Kafka listener không tìm thấy notification cho ĐƠN HÀNG MỚI: {}",
                        event.getOrderId());
                return; // Bỏ qua
            }

            // Lấy thông báo đã tồn tại (KHÔNG TẠO MỚI)
            Notification notificationEntity = notificationOpt.get();
            // =================== KẾT THÚC SỬA ===================

            NotificationDto notificationDto = notificationMapper.toDto(notificationEntity);
            messagingTemplate.convertAndSend(STAFF_TOPIC, notificationDto);
            log.info("Đã đẩy thông báo đơn hàng mới (ID: {}) qua WebSocket.", notificationEntity.getId());

        } catch (Exception e) {
            log.error("Lỗi khi parse hoặc xử lý B2BOrderPlacedEvent: {}", e.getMessage(), e);
        }
    }

    /**
     * Lắng nghe sự kiện "Tồn kho thấp" từ inventory-service
     */
    @KafkaListener(topics = LOW_STOCK_TOPIC, groupId = "${spring.kafka.consumer.group-id}")
    public void handleLowStockAlert(String payload) {
        log.info("Kafka Listener: Nhận được sự kiện TỒN KHO THẤP...");
        try {
            // Parse DTO sự kiện từ common-lib
            StockAlertEvent event = objectMapper.readValue(payload, StockAlertEvent.class);

            // Tạo message và link (dùng dữ liệu đã được làm giàu)
            String message = String.format(
                    "Cảnh báo: %s (SKU: %s) sắp hết hàng! (Tồn kho: %d / Ngưỡng: %d)",
                    event.getVariantName(),
                    event.getSkuCode(),
                    event.getCurrentStock(),
                    event.getThreshold());

            String link = "/evm/staff/distribution/inventory/central";

            Notification notificationEntity = Notification.builder()
                    .type("INVENTORY_ALERT")
                    .message(message)
                    .link(link)
                    .audience(NotificationAudience.STAFF) // Gửi cho Staff
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            // Lưu vào DB
            Notification savedNotification = notificationRepository.save(notificationEntity);
            log.info("Đã lưu thông báo tồn kho thấp ID {} vào CSDL.", savedNotification.getId());

            // Map sang DTO
            NotificationDto notificationDto = notificationMapper.toDto(savedNotification);

            // Đẩy qua WebSocket cho frontend
            messagingTemplate.convertAndSend(STAFF_TOPIC, notificationDto);
            log.info("Đã đẩy thông báo tồn kho thấp qua WebSocket.");

        } catch (Exception e) {
            log.error("Lỗi khi parse hoặc xử lý StockAlertEvent: {}", e.getMessage(), e);
        }
    }
}
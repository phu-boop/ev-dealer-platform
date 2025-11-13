package com.ev.ai_service.listener;

import com.ev.common_lib.event.ProductUpdateEvent;
import com.ev.common_lib.event.DealerStockUpdatedEvent;
import com.ev.common_lib.model.InventoryTransactionEvent; // Giả sử bạn tạo DTO này

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsListener {

    /**
     * Lắng nghe các sự kiện từ inventory-service.
     * groupId phải khác với reporting-service để cả hai cùng nhận được tin.
     */
    @KafkaListener(topics = "inventory_events", groupId = "ai-inventory-group")
    public void handleInventoryEvent(InventoryTransactionEvent transaction) {
        
        System.out.println(">>> AI SERVICE: Đã nhận được sự kiện giao dịch kho!");
        System.out.println("    Sản phẩm (Variant ID): " + transaction.getVariantId());
        System.out.println("    Số lượng: " + transaction.getQuantity());
        System.out.println("    Loại giao dịch: " + transaction.getTransactionType());

        // TODO:
        // 1. Kiểm tra nếu transaction.getTransactionType() == SALE
        // 2. Thu thập dữ liệu này để huấn luyện mô hình dự báo nhu cầu (AC 2.c).
    }

    /**
     * Lắng nghe các sự kiện từ vehicle-catalog-service.
     * groupId phải khác với reporting-service.
     */
    @KafkaListener(topics = "product_events", groupId = "ai-product-group")
    public void handleProductUpdate(ProductUpdateEvent event) {

        System.out.println(">>> AI SERVICE: Đã nhận được sự kiện cập nhật sản phẩm!");
        System.out.println("    Sản phẩm (Variant ID): " + event.getVariantId());
        System.out.println("    Giá mới: " + event.getNewPrice());

        // TODO:
        // 1. Cập nhật "bảng giá" hoặc "thông tin sản phẩm" trong kho dữ liệu (data warehouse) của AI.
    }

    /**
     * === LISTENER MỚI ĐỂ TEST ===
     * Lắng nghe sự kiện KHO ĐẠI LÝ BỊ CẬP NHẬT.
     * Đây là sự kiện được gửi từ inventory-service khi hàm shipAllocatedStock chạy.
     */
    @KafkaListener(topics = "stock_events_dealerEVM", // Lấy từ .properties
                   groupId = "ai-analytics-group-v1") // Đặt tên group ID mới
    public void handleDealerStockUpdate(DealerStockUpdatedEvent event) {
        
        // --- Đây là code test đơn giản bạn yêu cầu ---
        System.out.println(">>> AI SERVICE: [NHẬN THÀNH CÔNG] sự kiện DealerStockUpdatedEvent!");
        System.out.println("    - Variant ID: {}"+ event.getVariantId());
        System.out.println("    - Model Name: {}"+ event.getModelName());
        System.out.println("    - Dealer ID: {}"+ event.getDealerId());
        System.out.println("    - Số lượng khả dụng MỚI: {}"+ event.getNewAvailableQuantity());
        System.out.println("    - Thời gian: {}"+ event.getLastUpdatedAt());

        // TODO: (Logic AI của bạn sẽ bắt đầu từ đây)
        // 1. Phân tích dữ liệu này (ví dụ: khu vực nào đang bán chạy).
        // 2. Lưu trữ vào Data Lake/Warehouse của AI.
    }
}
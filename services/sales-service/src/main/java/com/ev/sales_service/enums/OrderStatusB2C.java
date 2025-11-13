package com.ev.sales_service.enums;

public enum OrderStatusB2C {
    PENDING,
    APPROVED,
    CONFIRMED,
    IN_PRODUCTION,
    READY_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    EDITED  // Đã chỉnh sửa (giữ lại để tương thích với dữ liệu cũ)
}

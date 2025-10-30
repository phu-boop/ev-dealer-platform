package com.ev.sales_service.enums;

public enum OrderStatus {
    PENDING,        // Chờ Hãng (EVM) xác nhận
    CONFIRMED,      // Hãng đã xác nhận (đã gọi API "allocate" kho)
    IN_TRANSIT,     // Hãng đã giao hàng (đã gọi API "ship")
    DELIVERED,      // Đại lý đã nhận hàng
    CANCELLED       // Đơn hàng đã bị hủy
}

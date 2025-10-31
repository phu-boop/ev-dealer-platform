package com.ev.sales_service.enums;

public enum QuotationStatus {
    DRAFT,      // Mới tạo, bản nháp, chưa gửi đi
    PENDING,    // Đã gửi cho quản lý duyệt
    APPROVED,   // Quản lý đã duyệt
    REJECTED,   // Quản lý đã từ chối
    EXPIRED     // Hết hạn
}

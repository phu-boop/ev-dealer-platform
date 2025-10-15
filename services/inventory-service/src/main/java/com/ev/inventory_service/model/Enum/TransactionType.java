package com.ev.inventory_service.model.Enum;

public enum TransactionType {
    INITIAL_STOCK,      // Nhập kho lần đầu từ nhà sản xuất
    RESTOCK,            // Bổ sung hàng vào kho trung tâm
    TRANSFER_TO_DEALER, // Điều chuyển từ kho trung tâm đến đại lý
    TRANSFER_TO_CENTRAL,// Điều chuyển từ đại lý về kho trung tâm
    SALE,               // Bán hàng (trừ kho)
    ADJUSTMENT_ADD,     // Điều chỉnh tăng (kiểm kho)
    ADJUSTMENT_SUBTRACT // Điều chỉnh giảm (kiểm kho)
}

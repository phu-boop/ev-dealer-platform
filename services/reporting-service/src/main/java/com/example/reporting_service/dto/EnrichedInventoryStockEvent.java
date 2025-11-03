package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO đại diện cho sự kiện tồn kho đã được làm giàu (enriched)
 * từ InventoryService, phục vụ cho việc cập nhật báo cáo tồn kho theo khu vực (EDMS-162).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedInventoryStockEvent {
    
    // Thông tin biến thể/mẫu xe (Yêu cầu EDMS-162)
    private String variantId;
    private String variantName;
    private String modelId;
    private String modelName;
    
    // Thông tin vị trí (Yêu cầu EDMS-162)
    private String dealerId;
    private String region;
    
    // Tồn kho CẬP NHẬT (Số lượng cuối cùng sau giao dịch)
    private int stockOnHand; 
}
package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để đánh dấu phản hồi đã giải quyết xong
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResolveComplaintRequest {

    @NotBlank(message = "Resolution is required")
    private String resolution; // Mô tả kết quả xử lý

    private String resolvedByStaffId;
    private String resolvedByStaffName;

    private Boolean sendNotification = true; // Có gửi thông báo cho khách hàng không
}

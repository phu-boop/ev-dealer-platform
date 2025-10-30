package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignStaffRequest {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    private String note; // Ghi chú khi phân công (optional)
}

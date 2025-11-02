// Đây là sự kiện được bắn ra khi đại lý xác nhận đã nhận hàng.
package com.ev.common_lib.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDeliveredEvent {
    private UUID orderId;
    private UUID dealerId;
    private LocalDateTime deliveryDate;
}

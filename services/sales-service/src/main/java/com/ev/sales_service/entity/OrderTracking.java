package com.ev.sales_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "track_id", columnDefinition = "BINARY(16)")
    private UUID trackId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder salesOrder;

    @Column(name = "status", length = 50, nullable = false)
    private String status; // ví dụ: "Pending", "Approved", "Delivered", v.v.

    @Column(name = "update_date", nullable = false)
    private LocalDateTime updateDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "updated_by", columnDefinition = "BINARY(16)")
    private UUID updatedBy; // nên đổi sang UUID nếu hệ thống bạn dùng UUID cho user/staff
}

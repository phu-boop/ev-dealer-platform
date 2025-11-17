package com.ev.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "record_id", columnDefinition = "BINARY(16)")
    private UUID recordId;

    // --- Khóa ngoại từ các Service khác ---
    @Column(name = "order_id", columnDefinition = "BINARY(16)", nullable = false, unique = true)
    private UUID orderId; // << Khớp với sales_orders.order_id

    @Column(name = "customer_id", columnDefinition = "BINARY(16)", nullable = true) // Thêm columnDefinition
    private UUID customerId; // << Khớp với customers.customer_id (bigint)

    // --- Khóa ngoại nội bộ ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id") // Có thể null nếu là trả thẳng
    private PaymentPlan paymentPlan;

    // --- Thông tin tài chính ---
    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount; // Tổng giá trị đơn hàng (lấy từ order)

    @Column(name = "amount_paid", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO; // Số tiền đã thanh toán

    @Column(name = "remaining_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal remainingAmount; // totalAmount - amountPaid

    @Column(name = "status", length = 50, nullable = false)
    private String status; // Ví dụ: "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Tự động cập nhật remainingAmount trước khi lưu
    @PrePersist
    @PreUpdate
    public void calculateRemaining() {
        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }
        if (this.amountPaid == null) {
            this.amountPaid = BigDecimal.ZERO;
        }
        this.remainingAmount = this.totalAmount.subtract(this.amountPaid);
        this.updatedAt = LocalDateTime.now();
    }
}
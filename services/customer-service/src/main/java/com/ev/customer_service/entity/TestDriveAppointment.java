package com.ev.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_drive_appointments", indexes = {
    @Index(name = "idx_dealer_date", columnList = "dealer_id,appointment_date"),
    @Index(name = "idx_staff_date", columnList = "staff_id,appointment_date"),
    @Index(name = "idx_model_date", columnList = "model_id,appointment_date"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestDriveAppointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "variant_id")
    private Long variantId; // Phiên bản xe cụ thể (optional)

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "test_drive_location", length = 500)
    private String testDriveLocation; // Địa điểm lái thử

    @Column(name = "status", length = 20)
    private String status; // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason; // Lý do hủy

    @Column(name = "cancelled_by")
    private String cancelledBy; // Email người hủy

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes; // Ghi chú từ khách hàng

    @Column(name = "staff_notes", columnDefinition = "TEXT")
    private String staffNotes; // Ghi chú từ nhân viên

    @Column(name = "notification_sent")
    private Boolean notificationSent = false; // Đã gửi thông báo chưa

    @Column(name = "reminder_sent")
    private Boolean reminderSent = false; // Đã gửi nhắc nhở chưa

    @Column(name = "feedback_rating")
    private Integer feedbackRating; // 1-5

    @Column(name = "feedback_comment", columnDefinition = "TEXT")
    private String feedbackComment;

    @Column(name = "created_by")
    private String createdBy; // Email người tạo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy; // Email người cập nhật

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Tính toán thời gian kết thúc dựa trên appointment_date và duration_minutes
     */
    public LocalDateTime getEndTime() {
        if (appointmentDate != null && durationMinutes != null) {
            return appointmentDate.plusMinutes(durationMinutes);
        }
        return null;
    }

    /**
     * Kiểm tra xem lịch hẹn có đang active không (chưa hủy, chưa hoàn thành)
     */
    public boolean isActive() {
        return !"CANCELLED".equals(status) && !"COMPLETED".equals(status);
    }
}

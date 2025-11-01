package com.ev.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_drive_appointments")
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

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "appointment_date")
    private LocalDateTime appointmentDate;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "status", length = 20)
    private String status; // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "feedback_rating")
    private Integer feedbackRating; // 1-5

    @Column(name = "feedback_comment", columnDefinition = "TEXT")
    private String feedbackComment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

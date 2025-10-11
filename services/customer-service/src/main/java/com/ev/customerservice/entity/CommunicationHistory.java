package com.ev.customerservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "communication_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comm_id")
    private Long commId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "communication_type", length = 20)
    private String communicationType; // EMAIL, SMS, PHONE, APP

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_date")
    private LocalDateTime sentDate;

    @Column(name = "status", length = 20)
    private String status; // SENT, DELIVERED, READ, FAILED

    @Column(name = "staff_id")
    private Long staffId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

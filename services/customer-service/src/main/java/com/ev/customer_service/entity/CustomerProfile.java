package com.ev.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    @Column(name = "preferences_json", columnDefinition = "TEXT")
    private String preferencesJson; // JSON string for flexible preferences

    @Column(name = "budget_range", length = 50)
    private String budgetRange; // e.g., "20000-30000"

    @Column(name = "interested_models_json", columnDefinition = "TEXT")
    private String interestedModelsJson; // JSON array of model IDs

    @Column(name = "communication_pref", length = 20)
    private String communicationPref; // EMAIL, SMS, PHONE, APP

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

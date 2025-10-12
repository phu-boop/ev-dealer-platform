package com.ev.user_service.entity;

import lombok.*;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "dealer_staff_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerStaffProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "staff_id")
    private UUID staffId;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @Column(name = "position", length = 100)
    private String position;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "salary", precision = 15, scale = 2)
    private BigDecimal salary;

    @Column(name = "commission_rate", precision = 5, scale = 4)
    private BigDecimal commissionRate;
}
package com.ev.user_service.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "evm_staff_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvmStaffProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evm_staff_id")
    private Long evmStaffId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "role", length = 100)
    private String role;

    @Column(name = "permissions", length = 500)
    private String permissions;

    @Column(name = "specialization", length = 100)
    private String specialization;
}
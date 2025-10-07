package com.ev.user_service.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "admin_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_id")
    private Long adminId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "admin_level", length = 50)
    private String adminLevel;

    @Column(name = "system_permissions", length = 1000)
    private String systemPermissions;

    @Column(name = "access_scope", length = 200)
    private String accessScope;
}
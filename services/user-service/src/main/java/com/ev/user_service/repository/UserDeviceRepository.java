package com.ev.user_service.repository;

import com.ev.user_service.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserDeviceRepository extends JpaRepository<UserDevice, UUID> {
    Optional<UserDevice> findByUserIdAndFcmToken(UUID userId, String fcmToken);
    // ✅ Lấy tất cả thiết bị của user có role ADMIN
    @Query("""
        SELECT ud 
        FROM UserDevice ud
        JOIN User u ON u.id = ud.userId
        JOIN UserRole ur ON ur.userId = u.id
        JOIN Role r ON r.id = ur.roleId
        WHERE r.name = 'ADMIN'
    """)
    List<UserDevice> findAllAdminDevices();
}

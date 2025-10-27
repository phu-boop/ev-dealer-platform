package com.ev.user_service.repository;

import com.ev.user_service.entity.DealerStaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DealerStaffProfileRepository extends JpaRepository<DealerStaffProfile, UUID> {
        Optional<DealerStaffProfile> findByUserId(UUID userID);
}

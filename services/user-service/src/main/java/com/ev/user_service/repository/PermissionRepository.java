package com.ev.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ev.user_service.entity.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission,Long> {
}

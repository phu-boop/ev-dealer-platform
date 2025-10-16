package com.ev.customer_service.repository;

import com.ev.customer_service.entity.CustomerProfileAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerProfileAuditRepository extends JpaRepository<CustomerProfileAudit, Long> {
}

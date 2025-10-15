package com.ev.sales_service.repository;

import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    List<Promotion> findByStatus(PromotionStatus status);
}

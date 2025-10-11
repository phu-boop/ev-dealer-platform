package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VehicleModelHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleModelHistoryRepository extends JpaRepository<VehicleModelHistory, Long> {
    
}

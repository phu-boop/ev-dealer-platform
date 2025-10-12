package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VehicleVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleVariantRepository extends JpaRepository<VehicleVariant, Long> {
    
}

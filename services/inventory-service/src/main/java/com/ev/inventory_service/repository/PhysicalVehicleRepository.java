package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.PhysicalVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhysicalVehicleRepository extends JpaRepository<PhysicalVehicle, String> {

}

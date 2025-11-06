package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.PhysicalVehicle;
import com.ev.inventory_service.model.Enum.VehiclePhysicalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhysicalVehicleRepository extends JpaRepository<PhysicalVehicle, String> {

    /**
     * "SELECT * FROM physical_vehicle WHERE variant_id = ?1 AND status = ?2"
     */
    List<PhysicalVehicle> findByVariantIdAndStatus(Long variantId, VehiclePhysicalStatus status);

}

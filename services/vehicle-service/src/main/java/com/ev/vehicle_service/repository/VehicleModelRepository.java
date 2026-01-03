package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
// import java.util.UUID;
import java.util.Optional;

@Repository
public interface VehicleModelRepository extends JpaRepository<VehicleModel, Long> {
    /**
     * Lấy tất cả các Model và tải sẵn (eagerly fetch) danh sách các Variant của chúng
     * để giải quyết vấn đề N+1 Select khi lấy danh sách.
     */
    @Query("SELECT DISTINCT m FROM VehicleModel m LEFT JOIN FETCH m.variants")
    List<VehicleModel> findAllWithVariants();

    /**
     * Lấy một Model theo ID và tải sẵn tất cả các mối quan hệ liên quan (variants, features)
     * để giải quyết vấn đề N+1 Select khi xem chi tiết.
     */
    @Query("SELECT m FROM VehicleModel m " +
           "LEFT JOIN FETCH m.variants v " +
           "LEFT JOIN FETCH v.features f " +
           "LEFT JOIN FETCH f.vehicleFeature " +
           "WHERE m.modelId = :modelId")
    Optional<VehicleModel> findModelWithDetailsById(@Param("modelId") Long modelId);
}

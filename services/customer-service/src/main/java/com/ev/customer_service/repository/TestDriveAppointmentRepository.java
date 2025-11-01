package com.ev.customer_service.repository;

import com.ev.customer_service.entity.TestDriveAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TestDriveAppointmentRepository extends JpaRepository<TestDriveAppointment, Long> {

    List<TestDriveAppointment> findByCustomerCustomerId(Long customerId);

    List<TestDriveAppointment> findByDealerId(Long dealerId);

    List<TestDriveAppointment> findByStatus(String status);

    @Query("SELECT t FROM TestDriveAppointment t WHERE t.dealerId = :dealerId AND t.status = :status")
    List<TestDriveAppointment> findByDealerIdAndStatus(@Param("dealerId") Long dealerId, @Param("status") String status);

    @Query("SELECT t FROM TestDriveAppointment t WHERE t.appointmentDate BETWEEN :startDate AND :endDate")
    List<TestDriveAppointment> findAppointmentsByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}

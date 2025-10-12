package com.ev.customer_service.repository;

import com.ev.customer_service.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByCustomerCustomerId(Long customerId);

    List<Complaint> findByDealerId(Long dealerId);

    List<Complaint> findByStatus(String status);

    List<Complaint> findByPriority(String priority);

    List<Complaint> findByDealerIdAndStatus(Long dealerId, String status);
}

package com.ev.customer_service.repository;

import com.ev.customer_service.entity.CustomerFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerFeedbackRepository extends JpaRepository<CustomerFeedback, Long> {

    List<CustomerFeedback> findByCustomerCustomerId(Long customerId);

    List<CustomerFeedback> findByOrderId(Long orderId);

    List<CustomerFeedback> findByCategory(String category);

    @Query("SELECT f FROM CustomerFeedback f WHERE f.rating >= :minRating")
    List<CustomerFeedback> findByMinimumRating(@Param("minRating") Integer minRating);
}

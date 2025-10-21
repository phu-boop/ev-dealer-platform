package com.ev.dealer_service.repository;

import com.ev.dealer_service.entity.Dealer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealerRepository extends JpaRepository<Dealer, Long> {

    Optional<Dealer> findByDealerCode(String dealerCode);

    List<Dealer> findByStatus(String status);

    List<Dealer> findByCity(String city);

    List<Dealer> findByRegion(String region);

    @Query("SELECT d FROM Dealer d WHERE d.status = 'ACTIVE'")
    List<Dealer> findAllActiveDealers();

    @Query("SELECT d FROM Dealer d WHERE d.city = :city AND d.status = 'ACTIVE'")
    List<Dealer> findActiveDealersByCity(@Param("city") String city);

    boolean existsByDealerCode(String dealerCode);

    @Query("SELECT d FROM Dealer d WHERE LOWER(d.dealerName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(d.city) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Dealer> searchDealers(@Param("keyword") String keyword);
}

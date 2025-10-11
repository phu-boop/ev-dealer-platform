package com.ev.dealerservice.repository;

import com.ev.dealerservice.entity.DealerLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealerLocationRepository extends JpaRepository<DealerLocation, Long> {

    List<DealerLocation> findByDealerDealerId(Long dealerId);

    List<DealerLocation> findByCity(String city);

    List<DealerLocation> findByStatus(String status);

    List<DealerLocation> findByDealerDealerIdAndStatus(Long dealerId, String status);
}

package com.ev.dealerservice.repository;

import com.ev.dealerservice.entity.DealerTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealerTargetRepository extends JpaRepository<DealerTarget, Long> {

    List<DealerTarget> findByDealerDealerId(Long dealerId);

    Optional<DealerTarget> findByDealerDealerIdAndTargetPeriod(Long dealerId, String targetPeriod);

    List<DealerTarget> findByTargetPeriod(String targetPeriod);
}

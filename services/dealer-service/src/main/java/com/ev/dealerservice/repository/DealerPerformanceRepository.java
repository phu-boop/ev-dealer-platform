package com.ev.dealerservice.repository;

import com.ev.dealerservice.entity.DealerPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealerPerformanceRepository extends JpaRepository<DealerPerformance, Long> {

    List<DealerPerformance> findByDealerDealerId(Long dealerId);

    Optional<DealerPerformance> findByDealerDealerIdAndPeriod(Long dealerId, String period);

    List<DealerPerformance> findByPeriod(String period);

    @Query("SELECT dp FROM DealerPerformance dp WHERE dp.period = :period ORDER BY dp.ranking ASC")
    List<DealerPerformance> findByPeriodOrderByRanking(@Param("period") String period);
}

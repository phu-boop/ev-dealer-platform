package com.ev.ai_service.service;

import com.ev.ai_service.dto.*;
import com.ev.ai_service.entity.*;
import com.ev.ai_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service chính cho Demand Forecasting
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DemandForecastService {
    
    private final ForecastAlgorithmService algorithmService;
    private final SalesHistoryRepository salesHistoryRepository;
    private final InventorySnapshotRepository inventorySnapshotRepository;
    private final DemandForecastRepository forecastRepository;
    private final ProductionPlanRepository productionPlanRepository;
    
    /**
     * Tạo dự báo nhu cầu dựa trên request
     */
    @Transactional
    public ForecastResponse generateForecast(ForecastRequest request) {
        log.info("Generating forecast with request: {}", request);
        
        int daysToForecast = request.getDaysToForecast() != null ? 
            request.getDaysToForecast() : 30;
        int historyDays = 60; // Sử dụng 60 ngày lịch sử
        
        List<ForecastResult> results = new ArrayList<>();
        
        // Xác định danh sách variants cần dự báo
        List<Long> variantIds = determineVariantIds(request);
        
        for (Long variantId : variantIds) {
            try {
                ForecastResult result = forecastForVariant(
                    variantId, 
                    request, 
                    historyDays, 
                    daysToForecast
                );
                results.add(result);
            } catch (Exception e) {
                log.error("Error forecasting for variant {}: {}", variantId, e.getMessage());
            }
        }
        
        // Tạo summary
        ForecastSummary summary = createSummary(results);
        
        return ForecastResponse.builder()
            .generatedAt(LocalDate.now())
            .region(request.getRegion())
            .dealerId(request.getDealerId())
            .forecasts(results)
            .summary(summary)
            .build();
    }
    
    /**
     * Dự báo cho một variant cụ thể
     */
    private ForecastResult forecastForVariant(
        Long variantId, 
        ForecastRequest request,
        int historyDays,
        int daysToForecast
    ) {
        // Chọn phương pháp dự báo
        String method = request.getForecastMethod() != null ? 
            request.getForecastMethod() : "AUTO";
        
        Integer predictedDemand;
        
        switch (method.toUpperCase()) {
            case "MOVING_AVERAGE":
                predictedDemand = algorithmService.forecastWithMovingAverage(
                    variantId, historyDays, daysToForecast
                );
                break;
            case "LINEAR_REGRESSION":
                predictedDemand = algorithmService.forecastWithLinearRegression(
                    variantId, historyDays, daysToForecast
                );
                break;
            case "WEIGHTED_AVERAGE":
                predictedDemand = algorithmService.forecastWithWeightedAverage(
                    variantId, historyDays, daysToForecast
                );
                break;
            case "AUTO":
            default:
                predictedDemand = algorithmService.forecastAuto(
                    variantId, historyDays, daysToForecast
                );
                method = "AUTO";
                break;
        }
        
        // Tính confidence score
        Double confidence = algorithmService.calculateConfidence(variantId, historyDays);
        
        // Phân tích trend
        String trend = algorithmService.analyzeTrend(variantId, historyDays);
        
        // Lấy thông tin historical average
        Integer historicalAvg = calculateHistoricalAverage(variantId, historyDays);
        
        // Lấy current inventory
        Integer currentInventory = getCurrentInventory(variantId);
        
        // Tính recommended stock
        Integer recommendedStock = calculateRecommendedStock(predictedDemand, currentInventory);
        
        // Lưu forecast vào database
        DemandForecast forecast = DemandForecast.builder()
            .variantId(variantId)
            .dealerId(request.getDealerId() != null ? UUID.fromString(request.getDealerId()) : null)
            .region(request.getRegion())
            .forecastDate(LocalDate.now().plusDays(daysToForecast))
            .predictedDemand(predictedDemand)
            .confidenceScore(confidence)
            .forecastMethod(method)
            .createdAt(LocalDateTime.now())
            .build();
        
        forecastRepository.save(forecast);
        
        return ForecastResult.builder()
            .variantId(variantId)
            .variantName("Variant " + variantId) // TODO: Lấy từ vehicle service
            .modelName("Model") // TODO: Lấy từ vehicle service
            .forecastDate(LocalDate.now().plusDays(daysToForecast))
            .predictedDemand(predictedDemand)
            .confidenceScore(confidence)
            .forecastMethod(method)
            .historicalAverage(historicalAvg)
            .trend(trend)
            .currentInventory(currentInventory)
            .recommendedStock(recommendedStock)
            .build();
    }
    
    /**
     * Xác định danh sách variant IDs cần dự báo
     */
    private List<Long> determineVariantIds(ForecastRequest request) {
        if (request.getVariantIds() != null && !request.getVariantIds().isEmpty()) {
            return request.getVariantIds();
        }
        
        if (request.getVariantId() != null) {
            return List.of(request.getVariantId());
        }
        
        // Lấy top variants có sales gần đây
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);
        
        List<Object[]> topVariants = salesHistoryRepository
            .getTopSellingVariants(startDate, endDate);
        
        return topVariants.stream()
            .limit(10) // Lấy top 10
            .map(row -> (Long) row[0])
            .collect(Collectors.toList());
    }
    
    /**
     * Tính trung bình lịch sử
     */
    private Integer calculateHistoricalAverage(Long variantId, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        
        Integer total = salesHistoryRepository.sumQuantityByVariantAndDateRange(
            variantId, startDate, endDate
        );
        
        return total != null ? total / days : 0;
    }
    
    /**
     * Lấy tồn kho hiện tại
     */
    private Integer getCurrentInventory(Long variantId) {
        return inventorySnapshotRepository
            .findTopByVariantIdOrderBySnapshotDateDesc(variantId)
            .map(InventorySnapshot::getAvailableQuantity)
            .orElse(0);
    }
    
    /**
     * Tính recommended stock level
     */
    private Integer calculateRecommendedStock(Integer predictedDemand, Integer currentInventory) {
        // Safety stock = 20% của predicted demand
        int safetyStock = (int) (predictedDemand * 0.2);
        int recommendedTotal = predictedDemand + safetyStock;
        
        return Math.max(0, recommendedTotal - currentInventory);
    }
    
    /**
     * Tạo summary từ kết quả dự báo
     */
    private ForecastSummary createSummary(List<ForecastResult> results) {
        int totalPredicted = results.stream()
            .mapToInt(ForecastResult::getPredictedDemand)
            .sum();
        
        int totalInventory = results.stream()
            .mapToInt(r -> r.getCurrentInventory() != null ? r.getCurrentInventory() : 0)
            .sum();
        
        int productionGap = Math.max(0, totalPredicted - totalInventory);
        
        double avgConfidence = results.stream()
            .mapToDouble(ForecastResult::getConfidenceScore)
            .average()
            .orElse(0.0);
        
        long highDemand = results.stream()
            .filter(r -> r.getPredictedDemand() > r.getHistoricalAverage() * 1.2)
            .count();
        
        long lowStock = results.stream()
            .filter(r -> r.getCurrentInventory() < r.getPredictedDemand() * 0.5)
            .count();
        
        // Phân tích overall trend
        Map<String, Long> trendCounts = results.stream()
            .collect(Collectors.groupingBy(ForecastResult::getTrend, Collectors.counting()));
        
        String overallTrend = trendCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("STABLE");
        
        return ForecastSummary.builder()
            .totalPredictedDemand(totalPredicted)
            .totalCurrentInventory(totalInventory)
            .productionGap(productionGap)
            .averageConfidence(avgConfidence)
            .highDemandVariants((int) highDemand)
            .lowStockVariants((int) lowStock)
            .overallTrend(overallTrend)
            .build();
    }
    
    /**
     * Lấy forecast theo region
     */
    public List<ForecastResult> getForecastByRegion(String region, LocalDate startDate, LocalDate endDate) {
        List<DemandForecast> forecasts = forecastRepository
            .findByRegionAndForecastDateBetween(region, startDate, endDate);
        
        return forecasts.stream()
            .map(this::mapToForecastResult)
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy forecast theo dealer
     */
    public List<ForecastResult> getForecastByDealer(UUID dealerId, LocalDate startDate, LocalDate endDate) {
        List<DemandForecast> forecasts = forecastRepository
            .findByDealerIdAndForecastDateBetween(dealerId, startDate, endDate);
        
        return forecasts.stream()
            .map(this::mapToForecastResult)
            .collect(Collectors.toList());
    }
    
    /**
     * Map entity to DTO
     */
    private ForecastResult mapToForecastResult(DemandForecast forecast) {
        return ForecastResult.builder()
            .variantId(forecast.getVariantId())
            .variantName(forecast.getVariantName())
            .modelName(forecast.getModelName())
            .forecastDate(forecast.getForecastDate())
            .predictedDemand(forecast.getPredictedDemand())
            .confidenceScore(forecast.getConfidenceScore())
            .forecastMethod(forecast.getForecastMethod())
            .build();
    }
}

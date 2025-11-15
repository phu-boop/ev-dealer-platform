package com.ev.ai_service.service;

import com.ev.ai_service.dto.ProductionPlanDto;
import com.ev.ai_service.entity.DemandForecast;
import com.ev.ai_service.entity.InventorySnapshot;
import com.ev.ai_service.entity.ProductionPlan;
import com.ev.ai_service.repository.DemandForecastRepository;
import com.ev.ai_service.repository.InventorySnapshotRepository;
import com.ev.ai_service.repository.ProductionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service cho Production Planning
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductionPlanService {
    
    private final DemandForecastRepository forecastRepository;
    private final InventorySnapshotRepository inventoryRepository;
    private final ProductionPlanRepository productionPlanRepository;
    
    /**
     * Tạo kế hoạch sản xuất cho tháng cụ thể
     */
    @Transactional
    public List<ProductionPlanDto> generateProductionPlan(LocalDate planMonth) {
        log.info("Generating production plan for month: {}", planMonth);
        
        // Lấy forecasts cho tháng này
        LocalDate monthStart = planMonth.withDayOfMonth(1);
        LocalDate monthEnd = planMonth.withDayOfMonth(planMonth.lengthOfMonth());
        
        List<DemandForecast> forecasts = forecastRepository
            .findTopForecastsByDateRange(monthStart, monthEnd);
        
        // Group theo variantId và tính tổng predicted demand
        var forecastsByVariant = forecasts.stream()
            .collect(Collectors.groupingBy(
                DemandForecast::getVariantId,
                Collectors.summingInt(DemandForecast::getPredictedDemand)
            ));
        
        List<ProductionPlanDto> plans = new ArrayList<>();
        
        for (var entry : forecastsByVariant.entrySet()) {
            Long variantId = entry.getKey();
            Integer predictedDemand = entry.getValue();
            
            try {
                ProductionPlanDto plan = createProductionPlan(
                    variantId, 
                    planMonth, 
                    predictedDemand
                );
                plans.add(plan);
            } catch (Exception e) {
                log.error("Error creating production plan for variant {}: {}", 
                    variantId, e.getMessage());
            }
        }
        
        // Sắp xếp theo priority
        plans.sort((p1, p2) -> {
            int priorityCompare = comparePriority(p1.getPriority(), p2.getPriority());
            if (priorityCompare != 0) return priorityCompare;
            return p2.getProductionGap().compareTo(p1.getProductionGap());
        });
        
        return plans;
    }
    
    /**
     * Tạo production plan cho một variant
     */
    private ProductionPlanDto createProductionPlan(
        Long variantId, 
        LocalDate planMonth, 
        Integer predictedDemand
    ) {
        // Lấy current inventory
        Integer currentInventory = inventoryRepository
            .findTopByVariantIdOrderBySnapshotDateDesc(variantId)
            .map(InventorySnapshot::getAvailableQuantity)
            .orElse(0);
        
        // Tính production gap
        // Gap = Predicted Demand + Safety Stock (20%) - Current Inventory
        int safetyStock = (int) (predictedDemand * 0.2);
        int productionGap = Math.max(0, predictedDemand + safetyStock - currentInventory);
        
        // Xác định priority
        String priority = determinePriority(predictedDemand, currentInventory, productionGap);
        
        // Tạo recommendations
        String recommendations = generateRecommendations(
            predictedDemand, 
            currentInventory, 
            productionGap, 
            priority
        );
        
        // Lưu vào database
        ProductionPlan plan = ProductionPlan.builder()
            .variantId(variantId)
            .planMonth(planMonth)
            .recommendedProduction(productionGap)
            .predictedDemand(predictedDemand)
            .currentInventory(currentInventory)
            .productionGap(productionGap)
            .priority(priority)
            .recommendations(recommendations)
            .status("DRAFT")
            .createdAt(LocalDateTime.now())
            .build();
        
        ProductionPlan saved = productionPlanRepository.save(plan);
        
        return mapToDto(saved);
    }
    
    /**
     * Xác định mức độ ưu tiên
     */
    private String determinePriority(Integer demand, Integer inventory, Integer gap) {
        double stockRatio = inventory / (double) Math.max(1, demand);
        
        if (stockRatio < 0.3 || gap > demand * 0.8) {
            return "HIGH"; // Tồn kho thấp hoặc gap lớn
        } else if (stockRatio < 0.6 || gap > demand * 0.5) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
    
    /**
     * Tạo recommendations
     */
    private String generateRecommendations(
        Integer demand, 
        Integer inventory, 
        Integer gap, 
        String priority
    ) {
        StringBuilder sb = new StringBuilder();
        
        if (priority.equals("HIGH")) {
            sb.append("⚠️ ƯU TIÊN CAO: ");
            if (inventory == 0) {
                sb.append("Tồn kho đã hết. ");
            } else {
                sb.append("Tồn kho thấp. ");
            }
            sb.append(String.format("Cần sản xuất ngay %d đơn vị. ", gap));
        } else if (priority.equals("MEDIUM")) {
            sb.append("⚡ Ưu tiên trung bình: ");
            sb.append(String.format("Cần sản xuất %d đơn vị trong tháng. ", gap));
        } else {
            sb.append("✓ Tồn kho ổn định. ");
            if (gap > 0) {
                sb.append(String.format("Có thể cân nhắc sản xuất thêm %d đơn vị. ", gap));
            }
        }
        
        double stockRatio = inventory / (double) Math.max(1, demand);
        sb.append(String.format("Tỷ lệ tồn kho/nhu cầu: %.1f%%. ", stockRatio * 100));
        
        return sb.toString();
    }
    
    /**
     * So sánh priority
     */
    private int comparePriority(String p1, String p2) {
        Map<String, Integer> priorityOrder = Map.of(
            "HIGH", 1,
            "MEDIUM", 2,
            "LOW", 3
        );
        
        return priorityOrder.getOrDefault(p1, 99)
            .compareTo(priorityOrder.getOrDefault(p2, 99));
    }
    
    /**
     * Lấy production plans theo tháng
     */
    public List<ProductionPlanDto> getProductionPlansByMonth(LocalDate month) {
        List<ProductionPlan> plans = productionPlanRepository
            .findPriorityPlansByMonth(month);
        
        return plans.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Approve production plan
     */
    @Transactional
    public ProductionPlanDto approveProductionPlan(Long planId) {
        ProductionPlan plan = productionPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Production plan not found"));
        
        plan.setStatus("APPROVED");
        plan.setApprovedAt(LocalDateTime.now());
        
        ProductionPlan saved = productionPlanRepository.save(plan);
        return mapToDto(saved);
    }
    
    /**
     * Map entity to DTO
     */
    private ProductionPlanDto mapToDto(ProductionPlan plan) {
        return ProductionPlanDto.builder()
            .id(plan.getId())
            .variantId(plan.getVariantId())
            .variantName(plan.getVariantName())
            .modelName(plan.getModelName())
            .planMonth(plan.getPlanMonth())
            .recommendedProduction(plan.getRecommendedProduction())
            .predictedDemand(plan.getPredictedDemand())
            .currentInventory(plan.getCurrentInventory())
            .productionGap(plan.getProductionGap())
            .priority(plan.getPriority())
            .recommendations(plan.getRecommendations())
            .status(plan.getStatus())
            .build();
    }
}

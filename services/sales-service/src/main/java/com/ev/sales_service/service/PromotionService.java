package com.ev.sales_service.service;

import com.ev.common_lib.event.PromotionCreatedEvent;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.repository.OutboxRepository;
import com.ev.sales_service.repository.PromotionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    @Value("${user-service.base-url}")
    private String userServiceBaseUrl;

    private final PromotionRepository promotionRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper; // spring-boot auto-configures

    @Transactional
    public Promotion createPromotion(Promotion promotion) {
        promotion.setStatus(PromotionStatus.DRAFT);
        Promotion saved = promotionRepository.save(promotion);

        // prepare event
        String eventId = UUID.randomUUID().toString();
        PromotionCreatedEvent event = new PromotionCreatedEvent(
                eventId,
                saved.getPromotionId(),
                saved.getPromotionName(),
                saved.getDescription(),
                saved.getDiscountRate(),
                saved.getStartDate(),
                saved.getEndDate(),
                LocalDateTime.now()
        );

        try {
            String payload = objectMapper.writeValueAsString(event);

            Outbox out = Outbox.builder()
                    .id(eventId)
                    .aggregateType("Promotion")
                    .aggregateId(saved.getPromotionId().toString())
                    .eventType("PromotionCreated")
                    .payload(payload)
                    .status("NEW")
                    .attempts(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            outboxRepository.save(out);
        } catch (Exception e) {
            // Nếu serialize lỗi thì rollback transaction (thrown exception)
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return saved;
    }

    public Promotion updatePromotion(UUID id, Promotion promotion) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found"));
        existing.setPromotionName(promotion.getPromotionName());
        existing.setDescription(promotion.getDescription());
        existing.setDiscountRate(promotion.getDiscountRate());
        existing.setStartDate(promotion.getStartDate());
        existing.setEndDate(promotion.getEndDate());
        existing.setApplicableModelsJson(promotion.getApplicableModelsJson());
        existing.setStatus(promotion.getStatus());
        return promotionRepository.save(existing);
    }

    public Promotion getPromotionById(UUID id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found"));
    }

    public List<Promotion> getAllPromotions() {
        updatePromotionStatuses();
        return promotionRepository.findAll();
    }


    private void updatePromotionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions = promotionRepository.findAll();

        for (Promotion promotion : promotions) {
            if (promotion.getStartDate() != null && promotion.getEndDate() != null) {
                if (promotion.getStatus().equals(PromotionStatus.ACTIVE)) {
                    if (promotion.getEndDate().isBefore(now)) {
                        promotion.setStatus(PromotionStatus.EXPIRED);
                    } else if (promotion.getStartDate().isAfter(now)) {
                        promotion.setStatus(PromotionStatus.INACTIVE);
                    }
                }
            }
        }

        promotionRepository.saveAll(promotions);
    }


    public void deletePromotion(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));
        promotion.setStatus(PromotionStatus.DELETED);
        promotionRepository.save(promotion);
    }

    public List<Promotion> getPromotionsByStatus(PromotionStatus status) {
        return promotionRepository.findByStatus(status);
    }

    public Promotion authenticPromotion(UUID id) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found"));
        existing.setStatus(PromotionStatus.ACTIVE);
        return promotionRepository.save(existing);
    }

    /**
     * Lấy các KM đang ACTIVE cho một đại lý cụ thể
     * (Phục vụ cho Form tạo báo giá)
     *
     * @param dealerId ID của đại lý (lấy từ header)
     * @return List<Promotion>
     */
    public List<Promotion> getActivePromotionsForDealer(UUID dealerId) {
        // 1. Lấy tất cả KM đang ACTIVE
        List<Promotion> allActivePromotions = promotionRepository.findByStatus(PromotionStatus.ACTIVE);

        // 2. Lọc danh sách
        return allActivePromotions.stream()
                .filter(promo -> {
                    String dealerJson = promo.getDealerIdJson();
                    LocalDateTime now = LocalDateTime.now();

                    // 2.1. Kiểm tra ngày (phòng trường hợp cron job chưa chạy)
                    if (promo.getStartDate() != null && promo.getStartDate().isAfter(now)) {
                        return false;
                    }
                    if (promo.getEndDate() != null && promo.getEndDate().isBefore(now)) {
                        return false;
                    }

                    // 2.2. Nếu là KM chung (không áp dụng cho đại lý cụ thể) -> Thêm vào
                    if (dealerJson == null || dealerJson.isEmpty() || dealerJson.equals("[]")) {
                        return true;
                    }

                    // 2.3. Nếu là KM riêng, kiểm tra xem ID của đại lý có nằm trong chuỗi JSON không
                    return dealerJson.contains(dealerId.toString());
                })
                .collect(Collectors.toList());
    }
}


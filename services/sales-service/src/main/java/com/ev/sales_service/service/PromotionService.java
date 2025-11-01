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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
            if (promotion.getStartDate() == null || promotion.getEndDate() == null) continue;

            // Bỏ qua nếu đã xóa
            if (promotion.getStatus().equals(PromotionStatus.DELETED)) continue;

            // Hết hạn
            if (promotion.getEndDate().isBefore(now)) {
                promotion.setStatus(PromotionStatus.EXPIRED);
                continue;
            }

            // Chưa đến ngày bắt đầu
            if (promotion.getStartDate().isAfter(now)) {
                if (promotion.getStatus().equals(PromotionStatus.DRAFT)) {
                    promotion.setStatus(PromotionStatus.NEAR); // Đã duyệt nhưng chưa tới hạn
                }
                continue;
            }
            // Đang trong thời gian hoạt động
            if (promotion.getStartDate().isBefore(now) && promotion.getEndDate().isAfter(now)) {
                if (promotion.getStatus().equals(PromotionStatus.DRAFT)) {
                    promotion.setStatus(PromotionStatus.INACTIVE); // Đã tới ngày nhưng chưa kích hoạt
                } else if (promotion.getStatus().equals(PromotionStatus.NEAR)) {
                    promotion.setStatus(PromotionStatus.ACTIVE); // Đã duyệt và tới ngày
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
        existing.setStatus(PromotionStatus.NEAR);
        return promotionRepository.save(existing);
    }
}


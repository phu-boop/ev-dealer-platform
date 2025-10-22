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
        return promotionRepository.findAll();
    }

    public void deletePromotion(UUID id) {
        if (!promotionRepository.existsById(id)) {
            throw new EntityNotFoundException("Promotion not found");
        }
        promotionRepository.deleteById(id);
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
}


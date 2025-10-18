package com.ev.sales_service.service;

import com.ev.sales_service.dto.outbound.PromotionDTO;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.repository.PromotionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionService {

    @Value("${user-service.base-url}")
    private String userServiceBaseUrl;
    private final PromotionRepository promotionRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public Promotion createPromotion(Promotion promotion) {
        Promotion saved = promotionRepository.save(promotion);
        // ✅ Gửi thông báo sang user_service
        try {
            PromotionDTO dto = new PromotionDTO(saved.getPromotionId(), saved.getPromotionName());
            restTemplate.postForObject(
                    userServiceBaseUrl+"users/notifications/promotions",
                    dto,
                    Void.class
            );
        } catch (Exception e) {
            e.printStackTrace(); // hoặc log warning nếu user_service không phản hồi
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


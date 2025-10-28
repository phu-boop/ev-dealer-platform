package com.ev.sales_service.service;

import com.ev.common_lib.exception.AppException; // Bạn cần import AppException từ common-lib
import com.ev.common_lib.exception.ErrorCode; // Bạn cần import ErrorCode từ common-lib
import com.ev.sales_service.dto.outbound.PromotionDTO;
import com.ev.sales_service.dto.outbound.QuotationRequestDTO;
import com.ev.sales_service.dto.outbound.QuotationResponseDTO;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.enums.QuotationStatus;
import com.ev.sales_service.repository.PromotionRepository;
import com.ev.sales_service.repository.QuotationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j // Thêm thư viện Log
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final PromotionRepository promotionRepository;
    // private final VehicleServiceClient vehicleServiceClient; // Tương lai sẽ dùng
    // private final CustomerServiceClient customerServiceClient; // Tương lai sẽ dùng

    @Transactional
    public QuotationResponseDTO createQuotation(QuotationRequestDTO request) {

        // --- Bước 1: Lấy thông tin User (Tạm thời Hardcode) ---
        // TODO: Sau này sẽ lấy từ SecurityContext (Token)
        UUID staffId = UUID.fromString("e1c9cfba-f35e-41db-aedc-bc1f6802c08e"); // StafffDealer@gmail.com
        UUID dealerId = UUID.fromString("5542f79e-5116-4f85-9cd3-d8b8b79512ae"); // ID đại lý của staff trên

        // --- Bước 2: Gọi VehicleService (Tạm thời Hardcode) ---
        // TODO: Gọi API từ VehicleService để lấy thông tin variant
        // VehicleVariantDTO variant = vehicleServiceClient.getVariantById(request.getVariantId());

        // Dữ liệu giả lập
        BigDecimal basePrice = getHardcodedPrice(request.getVariantId());
        Long modelId = getHardcodedModelId(request.getVariantId()); // Lấy modelId để check KM
        log.info("Vehicle variantId: {}, modelId: {}, basePrice: {}", request.getVariantId(), modelId, basePrice);

        // --- Bước 3: Xử lý Khuyến mãi (Logic EDMS-44) ---
        Set<Promotion> appliedPromotions = new HashSet<>();
        BigDecimal totalDiscount = BigDecimal.ZERO;

        if (request.getPromotionIds() != null && !request.getPromotionIds().isEmpty()) {
            List<Promotion> requestedPromotions = promotionRepository.findAllById(request.getPromotionIds());
            log.info("Found {} requested promotions", requestedPromotions.size());

            for (Promotion promo : requestedPromotions) {
                if (isValidPromotion(promo, modelId, dealerId)) {
                    appliedPromotions.add(promo);
                    // Tính giảm giá = Giá gốc * %KM
                    BigDecimal discount = basePrice.multiply(promo.getDiscountRate());
                    totalDiscount = totalDiscount.add(discount);
                    log.info("Applied promotion: {} with discount: {}", promo.getPromotionId(), discount);
                } else {
                    log.warn("Promotion {} is not valid for this quotation", promo.getPromotionId());
                }
            }
        }

        // --- Bước 4: Tính toán giá cuối cùng ---
        BigDecimal finalPrice = basePrice.subtract(totalDiscount);

        // --- Bước 5: Tạo và Lưu Entity ---
        Quotation quotation = Quotation.builder()
                .dealerId(dealerId)
                .staffId(staffId)
                .customerId(request.getCustomerId())
                .variantId(request.getVariantId())
                .modelId(modelId)
                .quotationDate(LocalDateTime.now())
                .validUntil(LocalDateTime.now().plusDays(7)) // Báo giá có hạn 7 ngày
                .basePrice(basePrice)
                .discountAmount(totalDiscount)
                .finalPrice(finalPrice)
                .termsConditions(request.getTermsConditions())
                .status(request.getSaveAsDraft() ? QuotationStatus.DRAFT : QuotationStatus.PENDING)
                .promotions(appliedPromotions) // Gán danh sách KM đã được duyệt
                .build();

        Quotation savedQuotation = quotationRepository.save(quotation);
        log.info("Quotation {} created successfully", savedQuotation.getQuotationId());

        // --- Bước 6: Chuyển đổi sang ResponseDTO ---
        return mapToResponseDTO(savedQuotation);
    }

    /**
     * Hàm kiểm tra logic khuyến mãi (EDMS-44)
     */
    private boolean isValidPromotion(Promotion promo, Long modelId, UUID dealerId) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Phải đang ACTIVE
        if (promo.getStatus() != PromotionStatus.ACTIVE) {
            log.warn("Promo validation failed: {} - Not ACTIVE", promo.getPromotionId());
            return false;
        }

        // 2. Phải còn hạn (ngày bắt đầu < hiện tại < ngày kết thúc)
        if (promo.getStartDate().isAfter(now) || promo.getEndDate().isBefore(now)) {
            log.warn("Promo validation failed: {} - EXPIRED", promo.getPromotionId());
            return false;
        }

        // 3. Phải đúng Model (applicableModelsJson)
        // applicableModelsJson là chuỗi JSON dạng "[1, 3]"
        String modelJson = promo.getApplicableModelsJson();
        if (modelJson != null && !modelJson.isEmpty() && !modelJson.equals("[]")) {
            if (!modelJson.contains(modelId.toString())) {
                log.warn("Promo validation failed: {} - Model ID {} not applicable", promo.getPromotionId(), modelId);
                return false; // KM này cho model khác
            }
        }

        // 4. Phải đúng Đại lý (dealerIdJson)
        // dealerIdJson là chuỗi JSON dạng "[\"uuid-1\", \"uuid-2\"]"
        String dealerJson = promo.getDealerIdJson();
        if (dealerJson != null && !dealerJson.isEmpty() && !dealerJson.equals("[]")) {
            if (!dealerJson.contains(dealerId.toString())) {
                log.warn("Promo validation failed: {} - Dealer ID {} not applicable", promo.getPromotionId(), dealerId);
                return false; // KM này cho đại lý khác
            }
        }

        // Vượt qua tất cả kiểm tra
        return true;
    }

    /**
     * Hàm chuyển đổi Entity sang DTO
     */
    private QuotationResponseDTO mapToResponseDTO(Quotation quotation) {
        List<PromotionDTO> promotionDTOs;
        if (quotation.getPromotions() != null) {
            promotionDTOs = quotation.getPromotions().stream()
                    .map(promo -> PromotionDTO.builder()
                            .id(promo.getPromotionId())
                            .promotionName(promo.getPromotionName())
                            .description(promo.getDescription())
                            .discountRate(promo.getDiscountRate())
                            .build())
                    .collect(Collectors.toList());
        } else {
            promotionDTOs = Collections.emptyList();
        }

        return QuotationResponseDTO.builder()
                .quotationId(quotation.getQuotationId())
                .customerId(quotation.getCustomerId())
                .variantId(quotation.getVariantId())
                .modelId(quotation.getModelId())
                .staffId(quotation.getStaffId())
                .dealerId(quotation.getDealerId())
                .quotationDate(quotation.getQuotationDate())
                .validUntil(quotation.getValidUntil())
                .status(quotation.getStatus())
                .basePrice(quotation.getBasePrice())
                .discountAmount(quotation.getDiscountAmount())
                .finalPrice(quotation.getFinalPrice())
                .termsConditions(quotation.getTermsConditions())
                .appliedPromotions(promotionDTOs)
                .build();
    }


    // --- CÁC HÀM GIẢ LẬP (SẼ XÓA KHI KẾT NỐI MICROSERVICE) ---

    private BigDecimal getHardcodedPrice(Long variantId) {
        // Lấy dữ liệu giả lập từ vehicle_db
        if (variantId == 4L) { // VF 9 Eco
            return new BigDecimal("1491000000.00");
        }
        if (variantId == 5L) { // VF 9 Plus
            return new BigDecimal("1684000000.00");
        }
        if (variantId == 10L) { // VF 6 Plus
            return new BigDecimal("1309000000.00");
        }
        // Mặc định
        return new BigDecimal("1000000000.00");
    }

    private Long getHardcodedModelId(Long variantId) {
        // Lấy dữ liệu giả lập từ vehicle_db
        if (variantId == 4L || variantId == 5L) {
            return 3L; // Model VF 9
        }
        if (variantId == 9L || variantId == 10L) {
            return 6L; // Model VF 6
        }
        // Mặc định
        return 1L;
    }
}
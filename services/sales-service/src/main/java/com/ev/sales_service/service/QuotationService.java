package com.ev.sales_service.service;

import com.ev.common_lib.exception.AppException; // Bạn cần import AppException từ common-lib
import com.ev.common_lib.exception.ErrorCode; // Bạn cần import ErrorCode từ common-lib
import com.ev.sales_service.dto.outbound.PromotionDTO;
import com.ev.sales_service.dto.request.QuotationRequestDTO;
import com.ev.sales_service.dto.response.QuotationResponseDTO;
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
    public QuotationResponseDTO createQuotation(QuotationRequestDTO request, UUID staffId, UUID dealerId) {

        // --- Bước 1: Lấy thông tin User (Đã nhận từ Controller) ---
        // UUID staffId = UUID.fromString("e1c9cfba..."); // <-- XÓA DÒNG NÀY
        // UUID dealerId = UUID.fromString("5542f79e..."); // <-- XÓA DÒNG NÀY

        // --- Bước 2: Gọi VehicleService (Hardcode) ---
        BigDecimal basePrice = getHardcodedPrice(request.getVariantId());
        Long modelId = getHardcodedModelId(request.getVariantId());
        log.info("Vehicle variantId: {}, modelId: {}, basePrice: {}", request.getVariantId(), modelId, basePrice);

        // --- Bước 3: Xử lý Khuyến mãi (Logic EDMS-44) ---
        Set<Promotion> appliedPromotions = new HashSet<>();
        BigDecimal totalDiscount = BigDecimal.ZERO;

        if (request.getPromotionIds() != null && !request.getPromotionIds().isEmpty()) {
            List<Promotion> requestedPromotions = promotionRepository.findAllById(request.getPromotionIds());
            log.info("Found {} requested promotions", requestedPromotions.size());

            for (Promotion promo : requestedPromotions) {
                // SỬA: Dùng dealerId từ tham số
                if (isValidPromotion(promo, modelId, dealerId)) {
                    appliedPromotions.add(promo);
                    BigDecimal discount = basePrice.multiply(promo.getDiscountRate());
                    totalDiscount = totalDiscount.add(discount);
                    log.info("Applied promotion: {} with discount: {}", promo.getPromotionId(), discount);
                } else {
                    log.warn("Promotion {} is not valid for this quotation", promo.getPromotionId());
                }
            }
        }

        // ... (Bước 4: Tính toán giá cuối cùng - Giữ nguyên)
        BigDecimal finalPrice = basePrice.subtract(totalDiscount);

        // --- Bước 5: Tạo và Lưu Entity ---
        Quotation quotation = Quotation.builder()
                .dealerId(dealerId) // Dùng dealerId tham số
                .staffId(staffId) // Dùng staffId tham số
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
     * Cập nhật một báo giá đang PENDING hoặc DRAFT
     *
     * @param quotationId ID của báo giá cần sửa
     * @param request     DTO chứa thông tin mới
     * @return DTO báo giá đã được cập nhật
     */
    @Transactional
    public QuotationResponseDTO updateQuotation(UUID quotationId, QuotationRequestDTO request, UUID staffId, UUID dealerId, String userRole) {
        log.info("Attempting to update quotationId: {} by user: {}", quotationId, staffId);

        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        boolean canUpdate = false;

        // 1. Manager có thể sửa bất kỳ quote PENDING/DRAFT nào trong đại lý của họ
        if ("DEALER_MANAGER".equals(userRole)) {
            if (quotation.getDealerId().equals(dealerId) &&
                    (quotation.getStatus() == QuotationStatus.PENDING || quotation.getStatus() == QuotationStatus.DRAFT)) {
                canUpdate = true;
            }
        }
        // 2. Staff chỉ có thể sửa quote DRAFT của chính MÌNH
        else if ("DEALER_STAFF".equals(userRole)) {
            if (quotation.getStaffId().equals(staffId) && quotation.getStatus() == QuotationStatus.DRAFT) {
                canUpdate = true;
            }
        }

        if (!canUpdate) {
            log.warn("User {} FORBIDDEN to update quote {}. Role: {}, Status: {}", staffId, quotationId, userRole, quotation.getStatus());
            throw new AppException(ErrorCode.FORBIDDEN); // Lỗi 403
        }

        // --- Bước 4: Lấy thông tin xe ---
        BigDecimal basePrice = getHardcodedPrice(request.getVariantId());
        Long modelId = getHardcodedModelId(request.getVariantId());

        // --- Bước 5: Xử lý Khuyến mãi (SỬA: Dùng dealerId từ tham số) ---
        Set<Promotion> appliedPromotions = new HashSet<>();
        BigDecimal totalDiscount = BigDecimal.ZERO;

        if (request.getPromotionIds() != null && !request.getPromotionIds().isEmpty()) {
            List<Promotion> requestedPromotions = promotionRepository.findAllById(request.getPromotionIds());
            for (Promotion promo : requestedPromotions) {
                if (isValidPromotion(promo, modelId, dealerId)) { // <-- Dùng dealerId tham số
                    appliedPromotions.add(promo);
                    BigDecimal discount = basePrice.multiply(promo.getDiscountRate());
                    totalDiscount = totalDiscount.add(discount);
                }
            }
        }
        BigDecimal finalPrice = basePrice.subtract(totalDiscount);

        // --- Bước 6: Cập nhật các trường cho Entity cũ ---
        quotation.setCustomerId(request.getCustomerId());
        quotation.setVariantId(request.getVariantId());
        quotation.setModelId(modelId);
        quotation.setBasePrice(basePrice);
        quotation.setDiscountAmount(totalDiscount);
        quotation.setFinalPrice(finalPrice);
        quotation.setTermsConditions(request.getTermsConditions());
        quotation.setPromotions(appliedPromotions);
        // Cập nhật trạng thái: nếu đang SỬA, nó nên quay về PENDING (chờ duyệt lại)
        quotation.setStatus(request.getSaveAsDraft() ? QuotationStatus.DRAFT : QuotationStatus.PENDING);
        // Cập nhật người sửa (ví dụ)
        // quotation.setLastModifiedBy(staffId);
        // quotation.setQuotationDate(LocalDateTime.now()); // Cập nhật ngày báo giá

        Quotation updatedQuotation = quotationRepository.save(quotation);
        log.info("Quotation {} updated successfully", updatedQuotation.getQuotationId());

        // --- Bước 7: Trả về DTO ---
        return mapToResponseDTO(updatedQuotation);
    }

    /**
     * Hàm kiểm tra logic khuyến mãi
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

    /**
     * Lấy tất cả báo giá của một đại lý
     * @param dealerId ID của đại lý
     * @return Danh sách DTO báo giá
     */
    public List<QuotationResponseDTO> getQuotationsByDealerId(UUID dealerId) {
        log.info("Fetching all quotations for dealerId: {}", dealerId);
        List<Quotation> quotations = quotationRepository.findByDealerId(dealerId);

        // Sử dụng lại hàm mapToResponseDTO để chuyển đổi List<Entity> sang List<DTO>
        return quotations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả báo giá của một đại lý THEO TRẠNG THÁI
     * @param dealerId ID của đại lý
     * @param status Trạng thái (PENDING, APPROVED, v.v.)
     * @return Danh sách DTO báo giá
     */
    public List<QuotationResponseDTO> getQuotationsByDealerIdAndStatus(UUID dealerId, QuotationStatus status) {
        log.info("Fetching quotations for dealerId: {} with status: {}", dealerId, status);
        List<Quotation> quotations = quotationRepository.findByDealerIdAndStatus(dealerId, status);

        // Sử dụng lại hàm mapToResponseDTO
        return quotations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy báo giá của MỘT Staff (cho Staff)
     */
    public List<QuotationResponseDTO> getMyQuotations(UUID staffId) {
        log.info("Fetching all quotations for staffId: {}", staffId);
        List<Quotation> quotations = quotationRepository.findByStaffId(staffId);
        return quotations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy báo giá của MỘT Staff theo status (cho Staff)
     */
    public List<QuotationResponseDTO> getMyQuotationsByStatus(UUID staffId, QuotationStatus status) {
        log.info("Fetching quotations for staffId: {} with status: {}", staffId, status);

        // Bạn có thể tạo hàm findByStaffIdAndStatus trong Repository
        // Hoặc lọc bằng Java Stream như sau:
        List<Quotation> quotations = quotationRepository.findByStaffId(staffId).stream()
                .filter(q -> q.getStatus() == status)
                .collect(Collectors.toList());

        return quotations.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết một báo giá bằng ID
     * (Phục vụ trang Chi tiết & Chỉnh sửa)
     */
    public QuotationResponseDTO getQuotationDetailsById(UUID quotationId) {
        log.info("Fetching details for quotationId: {}", quotationId);

        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        return mapToResponseDTO(quotation);
    }

    /**
     * Cập nhật trạng thái của một báo giá
     *
     * @param quotationId ID của báo giá cần cập nhật
     * @param newStatus   Trạng thái mới (APPROVED hoặc REJECTED)
     * @return DTO báo giá đã được cập nhật
     */
    @Transactional
    public QuotationResponseDTO updateQuotationStatus(UUID quotationId, QuotationStatus newStatus, String userRole) { // <-- THÊM userRole

        if (!"DEALER_MANAGER".equals(userRole)) {
            log.warn("User with role {} FORBIDDEN to update status.", userRole);
            throw new AppException(ErrorCode.FORBIDDEN); // Chỉ Manager được duyệt
        }

        log.info("Attempting to update status for quotationId: {} to {}", quotationId, newStatus);

        // 1. Chỉ cho phép cập nhật sang 2 trạng thái này
        if (newStatus != QuotationStatus.APPROVED && newStatus != QuotationStatus.REJECTED) {
            log.warn("Invalid status update attempt: {}", newStatus);
            // Bạn cần import AppException và ErrorCode từ common-lib
            throw new AppException(ErrorCode.INVALID_DATA);
        }

        // 2. Tìm báo giá
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> {
                    log.error("Quotation not found: {}", quotationId);
                    return new AppException(ErrorCode.DATA_NOT_FOUND);
                });

        // 3. Kiểm tra logic (ví dụ: chỉ duyệt báo giá PENDING)
        if (quotation.getStatus() != QuotationStatus.PENDING) {
            log.warn("Quotation {} is not in PENDING state. Current state: {}", quotationId, quotation.getStatus());
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        // 4. Cập nhật và Lưu
        quotation.setStatus(newStatus);

        // TODO: Sau này, khi duyệt báo giá, cần gọi sang InventoryService để "giữ" (allocate) chiếc xe.
        // if (newStatus == QuotationStatus.APPROVED) {
        //     inventoryServiceClient.allocateStock(quotation.getVariantId(), 1);
        // }

        Quotation updatedQuotation = quotationRepository.save(quotation);
        log.info("Quotation {} status updated to {}", updatedQuotation.getQuotationId(), updatedQuotation.getStatus());

        // 5. Trả về DTO
        return mapToResponseDTO(updatedQuotation);
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
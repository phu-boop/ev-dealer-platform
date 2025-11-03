package com.ev.sales_service.service.Implementation;

import com.ev.sales_service.dto.request.QuotationCalculateRequest;
import com.ev.sales_service.dto.request.QuotationCreateRequest;
import com.ev.sales_service.dto.request.QuotationFilterRequest;
import com.ev.sales_service.dto.request.QuotationSendRequest;
import com.ev.sales_service.dto.response.CustomerResponseRequest;
import com.ev.sales_service.dto.response.PromotionResponse;
import com.ev.sales_service.dto.response.QuotationResponse;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.enums.QuotationStatus;
import com.ev.sales_service.repository.PromotionRepository;
import com.ev.sales_service.repository.QuotationRepository;
import com.ev.sales_service.service.Interface.QuotationService;
import com.ev.sales_service.service.Interface.SalesOrderService;
import com.ev.sales_service.config.ModelMapperConfig;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class QuotationServiceImpl implements QuotationService {

    private final QuotationRepository quotationRepository;
    private final PromotionRepository promotionRepository;
    //private final SalesOrderService salesOrderService;
    private final ModelMapper modelMapper;

    @Override
    public QuotationResponse createDraftQuotation(QuotationCreateRequest request) {
        log.info("Creating draft quotation for customer: {}", request.getCustomerId());

        Quotation quotation = Quotation.builder()
                .dealerId(request.getDealerId())
                .customerId(request.getCustomerId())
                .modelId(request.getModelId())
                .variantId(request.getVariantId())
                .staffId(request.getStaffId())
                .basePrice(request.getBasePrice())
                .termsConditions(request.getTermsConditions())
                .status(QuotationStatus.DRAFT)
                .quotationDate(LocalDateTime.now())
                .build();

        Quotation savedQuotation = quotationRepository.save(quotation);
        return mapToResponse(savedQuotation);
    }

    @Override
    public QuotationResponse calculateQuotationPrice(UUID quotationId, QuotationCalculateRequest request) {
        log.info("Calculating price for quotation: {}", quotationId);

        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + quotationId));

        // Validate quotation status
        if (quotation.getStatus() != QuotationStatus.DRAFT && quotation.getStatus() != QuotationStatus.PENDING) {
            throw new RuntimeException("Quotation cannot be calculated in current status: " + quotation.getStatus());
        }

        // Lấy danh sách promotion để áp dụng
        Set<Promotion> appliedPromotions = new HashSet<>();
        BigDecimal totalDiscount = BigDecimal.ZERO;

        if (request.getPromotionIds() != null && !request.getPromotionIds().isEmpty()) {
            appliedPromotions = new HashSet<>(promotionRepository.findAllById(request.getPromotionIds()));

            // Tính tổng discount từ promotions
            for (Promotion promotion : appliedPromotions) {
                if (isPromotionApplicable(promotion, quotation)) {
                    BigDecimal discountAmount = quotation.getBasePrice()
                            .multiply(promotion.getDiscountRate())
                            .divide(BigDecimal.valueOf(100));
                    totalDiscount = totalDiscount.add(discountAmount);
                }
            }
        }

        // Áp dụng additional discount nếu có
        if (request.getAdditionalDiscountRate() != null) {
            BigDecimal additionalDiscount = quotation.getBasePrice()
                    .multiply(request.getAdditionalDiscountRate())
                    .divide(BigDecimal.valueOf(100));
            totalDiscount = totalDiscount.add(additionalDiscount);
        }

        // Đảm bảo discount không vượt quá base price
        if (totalDiscount.compareTo(quotation.getBasePrice()) > 0) {
            totalDiscount = quotation.getBasePrice();
        }

        BigDecimal finalPrice = quotation.getBasePrice().subtract(totalDiscount);

        // Cập nhật quotation
        quotation.setDiscountAmount(totalDiscount);
        quotation.setFinalPrice(finalPrice);
        quotation.setPromotions(appliedPromotions);
        quotation.setStatus(QuotationStatus.PENDING);

        Quotation updatedQuotation = quotationRepository.save(quotation);
        return mapToResponse(updatedQuotation);
    }

    @Override
    public QuotationResponse sendQuotationToCustomer(UUID quotationId, QuotationSendRequest request) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        if (quotation.getStatus() != QuotationStatus.PENDING) {
            throw new RuntimeException("Quotation must be in PENDING status to send");
        }

        if (quotation.getFinalPrice() == null) {
            throw new RuntimeException("Quotation must be calculated before sending");
        }

        quotation.setValidUntil(request.getValidUntil());
        quotation.setTermsConditions(request.getTermsConditions());
        quotation.setQuotationDate(LocalDateTime.now());
        quotation.setStatus(QuotationStatus.SENT);

        Quotation updatedQuotation = quotationRepository.save(quotation);

        // TODO: Gửi email/thông báo cho khách hàng
        log.info("Quotation {} sent to customer, valid until: {}", quotationId, request.getValidUntil());

        return mapToResponse(updatedQuotation);
    }

    @Override
    public QuotationResponse handleCustomerResponse(UUID quotationId, CustomerResponseRequest request) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        if (quotation.getStatus() != QuotationStatus.SENT) {
            throw new RuntimeException("Quotation must be in SENT status to accept/reject");
        }

        if (request.getAccepted()) {
            quotation.setStatus(QuotationStatus.ACCEPTED);
            log.info("Quotation {} accepted by customer", quotationId);
        } else {
            quotation.setStatus(QuotationStatus.REJECTED);
            log.info("Quotation {} rejected by customer. Reason: {}", quotationId, request.getCustomerNote());
        }

        Quotation updatedQuotation = quotationRepository.save(quotation);
        return mapToResponse(updatedQuotation);
    }

//    @Override
//    public SalesOrderResponse convertToSalesOrder(UUID quotationId) {
//        Quotation quotation = quotationRepository.findById(quotationId)
//                .orElseThrow(() -> new RuntimeException("Quotation not found"));
//
//        if (quotation.getStatus() != QuotationStatus.ACCEPTED) {
//            throw new RuntimeException("Quotation must be ACCEPTED to convert to sales order");
//        }
//
//        if (quotation.getSalesOrder() != null) {
//            throw new RuntimeException("Sales order already exists for this quotation");
//        }
//
//        return salesOrderService.createSalesOrderFromQuotation(quotationId);
//    }

    @Override
    public List<QuotationResponse> getQuotationsByFilters(QuotationFilterRequest filterRequest) {
        List<Quotation> quotations = quotationRepository.findByFilters(
                filterRequest.getDealerId(),
                filterRequest.getCustomerId(),
                filterRequest.getStaffId(),
                filterRequest.getStatus(),
                filterRequest.getStartDate(),
                filterRequest.getEndDate()
        );

        return quotations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void expireOldQuotations() {
        LocalDateTime now = LocalDateTime.now();
        List<Quotation> expiringQuotations = quotationRepository.findExpiringQuotations(now, now.plusDays(1));

        for (Quotation quotation : expiringQuotations) {
            if (quotation.getValidUntil().isBefore(now)) {
                quotation.setStatus(QuotationStatus.EXPIRED);
                quotationRepository.save(quotation);
                log.info("Quotation {} expired", quotation.getQuotationId());
            }
        }
    }

    // Helper methods
    private boolean isPromotionApplicable(Promotion promotion, Quotation quotation) {
        if (promotion.getStatus() != PromotionStatus.ACTIVE) return false;

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promotion.getStartDate()) || now.isAfter(promotion.getEndDate())) {
            return false;
        }

        // TODO: Implement JSON parsing for dealer and model validation
        return true;
    }

    private QuotationResponse mapToResponse(Quotation quotation) {
        QuotationResponse response = modelMapper.map(quotation, QuotationResponse.class);

        // Map promotions
        if (quotation.getPromotions() != null) {
            List<PromotionResponse> promotionResponses = quotation.getPromotions().stream()
                    .map(p -> modelMapper.map(p, PromotionResponse.class))
                    .collect(Collectors.toList());
            response.setAppliedPromotions(promotionResponses);
        }

        return response;
    }
    @Override
    public QuotationResponse getQuotationById(UUID quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + quotationId));
        return mapToResponse(quotation);
    }
}
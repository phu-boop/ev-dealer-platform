package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.request.QuotationCalculateRequest;
import com.ev.sales_service.dto.request.QuotationCreateRequest;
import com.ev.sales_service.dto.request.QuotationFilterRequest;
import com.ev.sales_service.dto.request.QuotationSendRequest;
import com.ev.sales_service.dto.response.*;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.enums.QuotationStatus;
import com.ev.sales_service.repository.PromotionRepository;
import com.ev.sales_service.repository.QuotationRepository;
import com.ev.sales_service.client.CustomerClient;
import com.ev.sales_service.service.Interface.EmailService;
import com.ev.sales_service.service.Interface.QuotationService;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2C;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final CustomerClient customerClient;
    private final QuotationRepository quotationRepository;
    private final PromotionRepository promotionRepository;
    private final EmailService emailService;
    private final ModelMapper modelMapper;

    private final SalesOrderServiceB2C salesOrderServiceB2C;
    @Autowired
    private final ObjectMapper objectMapper;

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
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        // Validate quotation status
        if (quotation.getStatus() != QuotationStatus.DRAFT && quotation.getStatus() != QuotationStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
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
                } else {
                    throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
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

    // phương thức sendQuotationToCustomer
    @Override
    public QuotationResponse sendQuotationToCustomer(UUID quotationId, QuotationSendRequest request) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        if (quotation.getFinalPrice() == null) {
            throw new AppException(ErrorCode.QUOTATION_NOT_CALCULATED);
        }

        quotation.setValidUntil(request.getValidUntil());
        quotation.setTermsConditions(request.getTermsConditions());
        quotation.setQuotationDate(LocalDateTime.now());
        quotation.setStatus(QuotationStatus.SENT);

        Quotation updatedQuotation = quotationRepository.save(quotation);

        // Gửi email cho khách hàng
        try {
            CustomerResponse customer = getCustomerInfo(quotation.getCustomerId());
            emailService.sendQuotationEmail(updatedQuotation, customer);
            log.info("Quotation email sent to customer: {}", customer.getEmail());
        } catch (Exception e) {
            log.error("Failed to send quotation email for quotation: {}", quotationId, e);
            // Không throw exception để tránh ảnh hưởng đến business logic chính
        }

        log.info("Quotation {} sent to customer, valid until: {}", quotationId, request.getValidUntil());
        return mapToResponse(updatedQuotation);
    }

    //  phương thức handleCustomerResponse
    @Override
    public QuotationResponse handleCustomerResponse(UUID quotationId, CustomerResponseRequest request) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.SENT) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        if (quotation.getValidUntil() != null && quotation.getValidUntil().isBefore(LocalDateTime.now())) {
            quotation.setStatus(QuotationStatus.EXPIRED);
            quotationRepository.save(quotation);
            throw new AppException(ErrorCode.QUOTATION_EXPIRED);
        }

        // Gửi email dựa trên phản hồi của khách hàng
        try {
            CustomerResponse customer = getCustomerInfo(quotation.getCustomerId());

            if (request.getAccepted()) {
                quotation.setStatus(QuotationStatus.ACCEPTED);
                emailService.sendQuotationAcceptedEmail(quotation, customer);
                log.info("Quotation accepted email sent to customer: {}", customer.getEmail());
            } else {
                quotation.setStatus(QuotationStatus.REJECTED);
                emailService.sendQuotationRejectedEmail(quotation, customer);
                log.info("Quotation rejected email sent to customer: {}", customer.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send customer response email for quotation: {}", quotationId, e);
            // Vẫn tiếp tục xử lý business logic chính
            if (request.getAccepted()) {
                quotation.setStatus(QuotationStatus.ACCEPTED);
            } else {
                quotation.setStatus(QuotationStatus.REJECTED);
            }
        }

        Quotation updatedQuotation = quotationRepository.save(quotation);
        return mapToResponse(updatedQuotation);
    }

    // Helper method để lấy thông tin khách hàng
    private CustomerResponse getCustomerInfo(Long customerId) {
        try {
            ApiRespond<CustomerResponse> response = customerClient.getCustomerById(customerId);
            if (response != null && response.getCode().equals("1000") && response.getData() != null) {
                return response.getData();
            }
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        } catch (Exception e) {
            log.error("Failed to get customer info for id: {}", customerId, e);
            throw new AppException(ErrorCode.CUSTOMER_SERVICE_UNAVAILABLE);
        }
    }

    @Override
    public SalesOrderB2CResponse convertToSalesOrderB2C(UUID quotationId) {
        log.info("Converting quotation to sales order: {}", quotationId);

        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.ACCEPTED) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        if (quotation.getSalesOrder() != null) {
            throw new AppException(ErrorCode.SALES_ORDER_ALREADY_EXISTS);
        }

        // Use B2C service for customer orders
        SalesOrderB2CResponse salesOrderResponse = salesOrderServiceB2C.createSalesOrderFromQuotation(quotationId);

        // Convert to common response format
        return convertToSalesOrderResponseB2C(salesOrderResponse);
    }

    private SalesOrderB2CResponse convertToSalesOrderResponseB2C(SalesOrderB2CResponse salesOrderB2C) {
        if (salesOrderB2C == null) {
            throw new AppException(ErrorCode.SALES_ORDER_NOT_FOUND);
        }

        SalesOrderB2CResponse response = new SalesOrderB2CResponse();

        response.setOrderId(salesOrderB2C.getOrderId());
        response.setDealerId(salesOrderB2C.getDealerId());
        response.setCustomerId(salesOrderB2C.getCustomerId());
        response.setStaffId(salesOrderB2C.getStaffId());
        response.setOrderDate(salesOrderB2C.getOrderDate());
        response.setDeliveryDate(salesOrderB2C.getDeliveryDate());
        response.setOrderStatusB2C(salesOrderB2C.getOrderStatusB2C());
        response.setTotalAmount(salesOrderB2C.getTotalAmount());
        response.setDownPayment(salesOrderB2C.getDownPayment());
        response.setManagerApproval(salesOrderB2C.getManagerApproval());
        response.setApprovedBy(salesOrderB2C.getApprovedBy());
        response.setTypeOder(salesOrderB2C.getTypeOder());
        response.setApprovalDate(salesOrderB2C.getApprovalDate());

        // Copy thêm các detail object
        response.setQuotation(salesOrderB2C.getQuotation());
        response.setSalesContract(salesOrderB2C.getSalesContract());
        response.setOrderItems(salesOrderB2C.getOrderItems());
        response.setOrderTrackings(salesOrderB2C.getOrderTrackings());

        return response;
    }


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

        try {
            // 1. Check dealer
            if (promotion.getDealerIdJson() != null && !promotion.getDealerIdJson().isEmpty()) {
                Set<UUID> dealerIds = objectMapper.readValue(
                        promotion.getDealerIdJson(),
                        new TypeReference<Set<UUID>>() {
                        }
                );
                if (!dealerIds.contains(quotation.getDealerId())) {
                    return false;
                }
            }

            // 2. Check model
            if (promotion.getApplicableModelsJson() != null && !promotion.getApplicableModelsJson().isEmpty()) {
                Set<Long> modelIds = objectMapper.readValue(
                        promotion.getApplicableModelsJson(),
                        new TypeReference<Set<Long>>() {
                        }
                );
                if (!modelIds.contains(quotation.getModelId())) {
                    return false;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

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
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));
        return mapToResponse(quotation);
    }

    @Override
    public List<QuotationResponse> getQuotationsByDealer(UUID dealerId) {
        List<Quotation> quotations = quotationRepository.findByDealerId(dealerId);
        return quotations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuotationResponse> getQuotationsByStaff(UUID staffId) {
        List<Quotation> quotations = quotationRepository.findByStaffId(staffId);
        return quotations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    @Override
public void deleteQuotation(UUID quotationId) {
    Quotation quotation = quotationRepository.findById(quotationId)
            .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

    // Chỉ cho phép xóa các quotation chưa được gửi hoặc đang ở trạng thái DRAFT/PENDING
    if (quotation.getStatus() != QuotationStatus.DRAFT && quotation.getStatus() != QuotationStatus.PENDING) {
        throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
    }

    quotationRepository.delete(quotation);
    log.info("Quotation {} deleted successfully", quotationId);
}

}
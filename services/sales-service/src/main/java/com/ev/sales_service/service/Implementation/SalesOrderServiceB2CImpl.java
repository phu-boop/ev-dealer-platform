package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.request.SalesOrderB2CCreateRequest;
import com.ev.sales_service.dto.response.*;
import com.ev.sales_service.entity.*;
import com.ev.sales_service.enums.*;
import com.ev.sales_service.repository.QuotationRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2C;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class SalesOrderServiceB2CImpl implements SalesOrderServiceB2C {

    private final SalesOrderRepositoryB2C salesOrderRepository;
    private final QuotationRepository quotationRepository;
    private final ModelMapper modelMapper;

    @Override
    public SalesOrderB2CResponse createSalesOrderFromQuotation(UUID quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        // Validate quotation status (ACCEPTED or COMPLETE are both valid)
        if (quotation.getStatus() != QuotationStatus.ACCEPTED && quotation.getStatus() != QuotationStatus.COMPLETE) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        // Check if sales order already exists
        if (quotation.getSalesOrder() != null) {
            throw new AppException(ErrorCode.SALES_ORDER_ALREADY_EXISTS);
        }

        // Create Sales Order from Quotation
        SalesOrder salesOrder = SalesOrder.builder()
                .quotation(quotation)
                .dealerId(quotation.getDealerId())
                .customerId(quotation.getCustomerId()) // Convert Long to UUID
                .staffId(quotation.getStaffId())
                .orderDate(LocalDateTime.now())
                .orderStatus(OrderStatusB2B.PENDING)
                .totalAmount(quotation.getFinalPrice())
                .downPayment(BigDecimal.ZERO) // TODO: Calculate based on business rules
                .managerApproval(false)
                .typeOder(SaleOderType.B2C)
                .build();

        // Create Sales Contract
        SalesContract salesContract = SalesContract.builder()
                .salesOrder(salesOrder)
                .contractDate(LocalDateTime.now())
                .contractStatus(ContractStatus.DRAFT)
                .contractTerms(quotation.getTermsConditions())
                .build();

        salesOrder.setSalesContract(salesContract);

        // Create initial order tracking
        OrderTracking orderTracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .status(OrderStatusB2B.PENDING.toString())
                .updateDate(LocalDateTime.now())
                .notes("Order created from quotation")
                .updatedBy(quotation.getStaffId())
                .build();

        salesOrder.setOrderTrackings(List.of(orderTracking));

        SalesOrder savedSalesOrder = salesOrderRepository.save(salesOrder);
        log.info("Created B2C sales order from quotation: {}", quotationId);

        return mapToResponse(savedSalesOrder);
    }

    @Override
    public SalesOrderB2CResponse createSalesOrder(SalesOrderB2CCreateRequest request) {
        // TODO: Implement direct sales order creation without quotation
        throw new UnsupportedOperationException("Direct sales order creation not implemented yet");
    }

    @Override
    public SalesOrderB2CResponse getSalesOrderById(UUID orderId) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Validate B2C type
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        return mapToResponse(salesOrder);
    }

    @Override
    public List<SalesOrderB2CResponse> getSalesOrdersByDealer(UUID dealerId) {
        List<SalesOrder> salesOrders = salesOrderRepository.findByDealerIdAndTypeOder(dealerId, SaleOderType.B2C);
        return salesOrders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SalesOrderB2CResponse> getSalesOrdersByCustomer(Long customerId) {
        List<SalesOrder> salesOrders = salesOrderRepository.findByCustomerIdAndTypeOder(customerId, SaleOderType.B2C);
        return salesOrders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SalesOrderB2CResponse updateSalesOrderStatus(UUID orderId, String status) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Validate B2C type
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        // TODO: Add status transition validation
        salesOrder.setOrderStatus(OrderStatusB2B.valueOf(status));

        // Add tracking entry
        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .status(status)
                .updateDate(LocalDateTime.now())
                .notes("Status updated to " + status)
                .updatedBy(salesOrder.getStaffId()) // TODO: Get current user from security context
                .build();

        salesOrder.getOrderTrackings().add(tracking);

        SalesOrder updatedSalesOrder = salesOrderRepository.save(salesOrder);
        return mapToResponse(updatedSalesOrder);
    }

        @Override
    public SalesOrderB2CResponse approveSalesOrder(UUID orderId, UUID managerId) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Validate B2C type
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        salesOrder.setManagerApproval(true);
        salesOrder.setApprovedBy(managerId);
        salesOrder.setApprovalDate(LocalDateTime.now());
        salesOrder.setOrderStatusB2C(OrderStatusB2C.APPROVED);

        // Add tracking entry
        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(salesOrder)
                .status(OrderStatusB2C.APPROVED.toString())
                .updateDate(LocalDateTime.now())
                .notes("Order approved by manager")
                .updatedBy(managerId)
                .build();

        salesOrder.getOrderTrackings().add(tracking);

        SalesOrder approvedSalesOrder = salesOrderRepository.save(salesOrder);
        return mapToResponse(approvedSalesOrder);
    }
    private SalesOrderB2CResponse mapToResponse(SalesOrder salesOrder) {
        if (salesOrder == null) return null;

        SalesOrderB2CResponse response = new SalesOrderB2CResponse();
        response.setOrderId(salesOrder.getOrderId());
        response.setDealerId(salesOrder.getDealerId());
        response.setCustomerId(salesOrder.getCustomerId());
        response.setStaffId(salesOrder.getStaffId());
        response.setOrderDate(salesOrder.getOrderDate());
        response.setDeliveryDate(salesOrder.getDeliveryDate());
        response.setOrderStatusB2C(salesOrder.getOrderStatusB2C());
        response.setTotalAmount(salesOrder.getTotalAmount());
        response.setDownPayment(salesOrder.getDownPayment());
        response.setManagerApproval(salesOrder.getManagerApproval());
        response.setApprovedBy(salesOrder.getApprovedBy());
        response.setTypeOder(salesOrder.getTypeOder());
        response.setApprovalDate(salesOrder.getApprovalDate());
        response.setPaymentStatus(salesOrder.getPaymentStatus()); // Payment status

        // Map Quotation
        if (salesOrder.getQuotation() != null) {
            QuotationResponse quotationResponse = new QuotationResponse();
            quotationResponse.setQuotationId(salesOrder.getQuotation().getQuotationId());
            quotationResponse.setModelId(salesOrder.getQuotation().getModelId());
            quotationResponse.setVariantId(salesOrder.getQuotation().getVariantId());
            quotationResponse.setCustomerId(salesOrder.getQuotation().getCustomerId());
            quotationResponse.setStaffId(salesOrder.getQuotation().getStaffId());
            quotationResponse.setBasePrice(salesOrder.getQuotation().getBasePrice());
            quotationResponse.setDiscountAmount(salesOrder.getQuotation().getDiscountAmount());
            quotationResponse.setFinalPrice(salesOrder.getQuotation().getFinalPrice());
            quotationResponse.setStatus(salesOrder.getQuotation().getStatus());
            response.setQuotation(quotationResponse);
        }

        // Map SalesContract
        if (salesOrder.getSalesContract() != null) {
            SalesContractResponse contractResponse = new SalesContractResponse();
            contractResponse.setContractId(salesOrder.getSalesContract().getContractId());
            contractResponse.setContractDate(salesOrder.getSalesContract().getContractDate());
            contractResponse.setContractStatus(salesOrder.getSalesContract().getContractStatus());
            contractResponse.setContractTerms(salesOrder.getSalesContract().getContractTerms());
            contractResponse.setSigningDate(salesOrder.getSalesContract().getSigningDate());
            contractResponse.setContractFileUrl(salesOrder.getSalesContract().getContractFileUrl());
            contractResponse.setDigitalSignature(salesOrder.getSalesContract().getDigitalSignature());
            response.setSalesContract(contractResponse);
        }

        // Map OrderItems
        if (salesOrder.getOrderItems() != null) {
            List<OrderItemResponse> itemResponses = salesOrder.getOrderItems().stream()
                    .map(item -> {
                        OrderItemResponse itemResponse = new OrderItemResponse();
                        itemResponse.setVariantId(item.getVariantId());
                        itemResponse.setQuantity(item.getQuantity());
                        itemResponse.setUnitPrice(item.getUnitPrice());
                        itemResponse.setDiscount(item.getDiscount());
                        itemResponse.setFinalPrice(item.getFinalPrice());
                        return itemResponse;
                    }).toList();
            response.setOrderItems(itemResponses);
        }


        // Map OrderTrackings
        if (salesOrder.getOrderTrackings() != null) {
            List<OrderTrackingResponse> trackingResponses = salesOrder.getOrderTrackings().stream()
                    .map(track -> {
                        OrderTrackingResponse trackResp = new OrderTrackingResponse();
                        trackResp.setTrackId(track.getTrackId());
                        trackResp.setStatus(track.getStatus());
                        trackResp.setUpdateDate(track.getUpdateDate());
                        trackResp.setNotes(track.getNotes());
                        trackResp.setUpdatedBy(track.getUpdatedBy());
                        return trackResp;
                    }).toList();
            response.setOrderTrackings(trackingResponses);
        }

        return response;
    }

}
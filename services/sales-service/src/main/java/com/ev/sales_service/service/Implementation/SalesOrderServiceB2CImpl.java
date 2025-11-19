package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.client.CustomerClient;
import com.ev.sales_service.dto.request.SalesOrderB2CCreateRequest;
import com.ev.sales_service.dto.response.*;
import com.ev.sales_service.entity.*;
import com.ev.sales_service.enums.*;
import com.ev.sales_service.repository.OrderItemRepository;
import com.ev.sales_service.repository.QuotationRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import com.ev.sales_service.service.Interface.EmailService;
import com.ev.sales_service.service.Interface.SalesContractService;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2C;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final OrderItemRepository orderItemRepository;
    private final SalesContractService salesContractService;
    private final EmailService emailService;
    private final CustomerClient customerClient;

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
                .customerId(quotation.getCustomerId())
                .staffId(quotation.getStaffId())
                .orderDate(LocalDateTime.now())
                .orderStatusB2C(OrderStatusB2C.PENDING)
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
                .statusB2C(OrderTrackingStatus.CREATED)
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
        salesOrder.setOrderStatusB2C(OrderStatusB2C.valueOf(status));

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

        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.EDITED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

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
                .statusB2C(OrderTrackingStatus.CREATED)
                .updateDate(LocalDateTime.now())
                .notes("Order approved by manager")
                .updatedBy(managerId)
                .build();

        salesOrder.getOrderTrackings().add(tracking);

        SalesOrder approvedSalesOrder = salesOrderRepository.save(salesOrder);

        // --- Lấy thông tin khách hàng ---
        CustomerResponse customer = getCustomerInfo(salesOrder.getCustomerId());

        // --- Gửi email xác nhận ---
        try {
            emailService.sendOrderConfirmedEmail(salesOrder, customer);
            log.info("Order confirmation email sent to customer: {}", customer.getEmail());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for order: {}", orderId, e);
            // Không throw exception để không ảnh hưởng business logic chính
        }
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
                        trackResp.setStatus(track.getStatusB2C());
                        trackResp.setUpdateDate(track.getUpdateDate());
                        trackResp.setNotes(track.getNotes());
                        trackResp.setUpdatedBy(track.getUpdatedBy());
                        return trackResp;
                    }).toList();
            response.setOrderTrackings(trackingResponses);
        }

        return response;
    }

    public Long getModelIdBySalesOrderId(UUID salesOrderId) {
        SalesOrder salesOrder = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new RuntimeException("SalesOrder not found with ID: " + salesOrderId));

        if (salesOrder.getQuotation() == null) {
            throw new RuntimeException("Quotation not found for this SalesOrder");
        }

        return salesOrder.getQuotation().getModelId();
    }

    @Override
    @Transactional
    public SalesOrderB2CResponse addOrderItemsToSalesOrder(UUID orderId) {
        log.info("Processing existing order items for sales order: {}", orderId);

        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra loại đơn
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        // Chỉ cho phép khi đang ở trạng thái PENDING
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        List<OrderItem> existingItems = salesOrder.getOrderItems();
        if (existingItems == null || existingItems.isEmpty()) {
            throw new AppException(ErrorCode.ORDER_ITEMS_REQUIRED);
        }

        // Duyệt và validate từng item
        for (OrderItem item : existingItems) {
            if (item.getVariantId() == null) {
                throw new AppException(ErrorCode.VARIANT_ID_REQUIRED);
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_QUANTITY);
            }
            if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(ErrorCode.INVALID_UNIT_PRICE);
            }

            BigDecimal discount = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
            BigDecimal finalPrice = calculateFinalPrice(item.getUnitPrice(), item.getQuantity(), discount);
            item.setFinalPrice(finalPrice);
            item.setSalesOrder(salesOrder);
        }

        // Lưu danh sách item hiện tại (không thay collection)
        orderItemRepository.saveAll(existingItems);

        // Tính tổng tiền
        BigDecimal newTotalAmount = calculateOrderTotalFromItems(existingItems);
        salesOrder.setTotalAmount(newTotalAmount);

        // Tính tiền đặt cọc (30%)
        BigDecimal newDownPayment = calculateDownPayment(newTotalAmount);
        salesOrder.setDownPayment(newDownPayment);

        // Cập nhật trạng thái và reset phê duyệt
        salesOrder.setManagerApproval(false);
        salesOrder.setApprovedBy(null);
        salesOrder.setApprovalDate(null);

        SalesOrder updatedSalesOrder = salesOrderRepository.save(salesOrder);
        log.info("Recalculated {} order items for sales order {}, total amount: {}",
                existingItems.size(), orderId, newTotalAmount);

        return mapToResponse(updatedSalesOrder);
    }

    //
    // ==========================
    // Helper methods
    // ==========================

    /**
     * Tính giá cuối cùng sau khi áp dụng chiết khấu.
     *
     * @param unitPrice Đơn giá
     * @param quantity  Số lượng
     * @param discount  Phần trăm chiết khấu (0–100)
     * @return Giá cuối cùng sau khi giảm
     */
    private BigDecimal calculateFinalPrice(BigDecimal unitPrice, Integer quantity, BigDecimal discount) {
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal discountAmount = total.multiply(discount.divide(BigDecimal.valueOf(100)));
        return total.subtract(discountAmount);
    }

    /**
     * Tính tổng tiền của toàn bộ order items.
     *
     * @param orderItems Danh sách OrderItem
     * @return Tổng tiền đơn hàng
     */
    private BigDecimal calculateOrderTotalFromItems(List<OrderItem> orderItems) {
        return orderItems.stream()
                .map(OrderItem::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Tính tiền đặt cọc (ví dụ 30% tổng đơn hàng).
     *
     * @param totalAmount Tổng tiền đơn hàng
     * @return Số tiền đặt cọc
     */
    private BigDecimal calculateDownPayment(BigDecimal totalAmount) {
        BigDecimal downPaymentPercentage = new BigDecimal("0.30"); // 30%
        return totalAmount.multiply(downPaymentPercentage);
    }


    private CustomerResponse getCustomerInfo(Long customerId) {
        try {
            ApiRespond<CustomerResponse> response = customerClient.getCustomerById(customerId);
            if (response != null && "1000".equals(response.getCode()) && response.getData() != null) {
                return response.getData();
            }
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        } catch (Exception e) {
            log.error("Failed to get customer info for id: {}", customerId, e);
            throw new AppException(ErrorCode.CUSTOMER_SERVICE_UNAVAILABLE);
        }
    }

    @Override
    @Transactional
    public ApiRespond rejectOrder(String orderId, String reason) {
        SalesOrder salesOrder = salesOrderRepository.findById(UUID.fromString(orderId))
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.EDITED &&
                salesOrder.getOrderStatusB2C() != OrderStatusB2C.APPROVED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        salesOrder.setOrderStatusB2C(OrderStatusB2C.REJECTED);
        //xử lý khi khách hàng từ chối
        //salesOrder.setRejectReason(reason);
        salesOrderRepository.save(salesOrder);

        log.info("Sales order {} rejected. Reason: {}", orderId, reason);
        return ApiRespond.success("Đơn hàng đã bị từ chối bởi quản lý.", salesOrder);
    }


    @Override
    @Transactional
    public SalesContractResponse convertToContract(UUID orderId) {
        // Lấy đơn hàng
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra trạng thái đơn hàng
        if (order.getOrderStatusB2C() != OrderStatusB2C.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            // Nếu muốn thêm chi tiết, có thể dùng constructor: new AppException(ErrorCode.INVALID_ORDER_STATUS, "Chi tiết thêm")
        }

        // Kiểm tra hợp đồng đã tồn tại chưa
        if (order.getSalesContract() != null) {
            throw new AppException(ErrorCode.SALES_CONTRACT_ALREADY_EXISTS);
        }

        // Tạo contract từ template
        SalesContractResponse response = salesContractService.generateContractFromTemplate(orderId);

        log.info("Sales order [{}] converted to contract successfully.", orderId);
        return response;
    }


    @Override
    @Transactional
    public SalesOrderB2CResponse convertToComplete(UUID orderId) {
        // Lấy đơn hàng
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra trạng thái đơn hàng
        if (order.getOrderStatusB2C() != OrderStatusB2C.IN_PRODUCTION) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            // Nếu muốn thêm chi tiết, có thể dùng constructor: new AppException(ErrorCode.INVALID_ORDER_STATUS, "Chi tiết thêm")
        }

        // Kiểm tra hợp đồng đã tồn tại chưa
        if (order.getOrderTrackings() != null) {
            throw new AppException(ErrorCode.SALES_CONTRACT_ALREADY_EXISTS);
        }

        order.setOrderStatusB2C(OrderStatusB2C.DELIVERED);
        salesOrderRepository.save(order);

        return mapToResponse(order);
    }

    @Override
    public void handleCustomerOrderConfirmation(UUID orderId, boolean confirmed) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));

        if (confirmed) {
            order.setOrderStatusB2C(OrderStatusB2C.CONFIRMED);
            log.info("Order {} confirmed by customer", orderId);
        } else {
            order.setOrderStatusB2C(OrderStatusB2C.CANCELLED);
            log.info("Order {} cancelled by customer", orderId);
        }

        salesOrderRepository.save(order);
    }


    @Override
    @Transactional
    public SalesOrderB2CResponse markOrderAsEdited(UUID orderId, UUID staffId) {
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));

        // Kiểm tra loại đơn B2C
        if (salesOrder.getTypeOder() != SaleOderType.B2C) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        // Chỉ cho phép nếu trạng thái hiện tại là PENDING (có thể tuỳ business)
        if (salesOrder.getOrderStatusB2C() != OrderStatusB2C.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        // Cập nhật trạng thái
        salesOrder.setOrderStatusB2C(OrderStatusB2C.EDITED);

        SalesOrder updatedOrder = salesOrderRepository.save(salesOrder);
        log.info("Sales order {} marked as EDITED by staff {}", orderId, staffId);

        return mapToResponse(updatedOrder);
    }


}
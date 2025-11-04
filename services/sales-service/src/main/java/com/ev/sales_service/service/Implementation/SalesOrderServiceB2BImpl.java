package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.dto.inventory.AllocationRequestDto;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.event.B2BOrderPlacedEvent; 
import com.ev.common_lib.event.OrderCancelledEvent;
import com.ev.common_lib.event.OrderDeliveredEvent;
import com.ev.sales_service.dto.request.CreateB2BOrderRequest;
import com.ev.sales_service.entity.OrderItem;
import com.ev.sales_service.entity.OrderTracking;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.enums.OrderStatusB2B;

// import com.ev.sales_service.repository.QuotationRepository; 
import com.ev.sales_service.enums.SaleOderType;
import com.ev.sales_service.repository.OutboxRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2B;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2B;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
// import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
// import org.springframework.web.client.HttpClientErrorException;
// import org.springframework.security.core.Authentication; 
// import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesOrderServiceB2BImpl implements SalesOrderServiceB2B {

    private final SalesOrderRepositoryB2B salesOrderRepositoryB2B;
    // private final QuotationRepository quotationRepository; // Bỏ comment nếu bạn dùng logic báo giá
    private final RestTemplate restTemplate;

    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.services.catalog.url}")
    private String vehicleCatalogUrl;

    private static final Logger log = LoggerFactory.getLogger(SalesOrderServiceB2BImpl.class);

    @Override
    @Transactional
    public SalesOrder createB2BOrder(CreateB2BOrderRequest request, String email, UUID dealerId) {
        
        SalesOrder order = new SalesOrder();
        order.setDealerId(dealerId);
        order.setCustomerId(null); // B2B
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(OrderStatusB2B.PENDING);
        order.setManagerApproval(false);
        // Lấy staffId từ email hoặc userId (từ header)
        // order.setStaffId(findStaffIdByEmail(email)); 

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Lặp qua các mục hàng
        for (CreateB2BOrderRequest.Item itemRequest : request.getItems()) {
            
            String url = vehicleCatalogUrl + "/vehicle-catalog/variants/" + itemRequest.getVariantId();
            ResponseEntity<ApiRespond<VariantDetailDto>> response;
            try {
                // Dùng .exchange() để đọc được cấu trúc ApiRespond<T>
                response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null, // Không có body
                        new ParameterizedTypeReference<ApiRespond<VariantDetailDto>>() {}
                );
            } catch (Exception e) {
                log.error("Error calling vehicle-catalog service for variant {}: {}", itemRequest.getVariantId(), e.getMessage());
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE); 
            }

            // Kiểm tra response
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().getData() == null) {
                log.error("Invalid response from vehicle-catalog for variant {}: {}", itemRequest.getVariantId(), response.getStatusCode());
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE); 
            }

            VariantDetailDto variantDetails = response.getBody().getData(); 
            
            // Logic lấy giá
            BigDecimal unitPrice = variantDetails.getWholesalePrice();
            if (unitPrice == null) {
                unitPrice = variantDetails.getPrice(); 
            }
            
            // Kiểm tra null lần cuối
            if (unitPrice == null) {
                 log.error("Cannot determine unit price for variant {}", variantDetails.getVariantId());
                 throw new AppException(ErrorCode.BAD_REQUEST); 
            }
            
            BigDecimal itemFinalPrice = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemFinalPrice);

            OrderItem orderItem = OrderItem.builder()
                    .salesOrder(order)
                    .variantId(itemRequest.getVariantId())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .discount(BigDecimal.ZERO) 
                    .finalPrice(itemFinalPrice)
                    .build();
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        // Tạo bản ghi theo dõi trạng thái đầu tiên
        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(order)
                .status("ĐÃ ĐẶT HÀNG")
                .updateDate(LocalDateTime.now())
                .notes("Đại lý đã tạo đơn hàng, chờ EVM xác nhận.")
                //.updatedBy(staffId) // Gán ID người tạo
                .build();
        
        order.setOrderTrackings(List.of(tracking)); // Khởi tạo list

        //set type
        order.setTypeOder(SaleOderType.B2B);
        // Lưu đơn hàng vào DB
        SalesOrder savedOrder = salesOrderRepositoryB2B.save(order);

        // TẠO SỰ KIỆN OUTBOX (thay vì gọi Kafka/notification)
        B2BOrderPlacedEvent eventPayload = B2BOrderPlacedEvent.builder()
                .orderId(savedOrder.getOrderId())
                .dealerId(savedOrder.getDealerId())
                .totalAmount(savedOrder.getTotalAmount())
                .orderDate(savedOrder.getOrderDate())
                .placedByEmail(email)
                .build();
        
        saveOutboxEvent(
            savedOrder.getOrderId(), 
            "SalesOrder", 
            "B2BOrderPlaced", // Tên sự kiện
            eventPayload        // Dữ liệu sự kiện
        );

        return savedOrder;
    }
    
    @Override
    @Transactional
    // Bỏ các tham số role, userId, profileId thừa
    public SalesOrder approveB2BOrder(UUID orderId, String email) {
        SalesOrder order = salesOrderRepositoryB2B.findByOrderIdAndTypeOder(orderId, SaleOderType.B2B)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND)); // Dùng constructor 1 tham số

        if (order.getOrderStatus() != OrderStatusB2B.PENDING) {
            throw new AppException(ErrorCode.BAD_REQUEST); // Dùng constructor 1 tham số
        }

        order.setOrderStatus(OrderStatusB2B.CONFIRMED);
        order.setManagerApproval(true);
        order.setApprovalDate(LocalDateTime.now());
        // order.setApprovedBy(findStaffIdByEmail(email)); // Logic lấy UUID người duyệt

        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(order)
                .status("ĐÃ TIẾP NHẬN ĐẶT XE")
                .updateDate(LocalDateTime.now())
                .notes("EVM Staff (" + email + ") đã xác nhận đơn hàng.")
                //.updatedBy(...) // Gán ID người duyệt
                .build();
        if (order.getOrderTrackings() == null) {
             order.setOrderTrackings(new ArrayList<>());
        }
        order.getOrderTrackings().add(tracking);

        // Chuẩn bị gọi API inventory-service
        AllocationRequestDto allocationRequest = new AllocationRequestDto();
        allocationRequest.setOrderId(orderId);
        List<AllocationRequestDto.AllocationItem> items = order.getOrderItems().stream()
            .map(item -> {
                AllocationRequestDto.AllocationItem allocItem = new AllocationRequestDto.AllocationItem();
                allocItem.setVariantId(item.getVariantId());
                allocItem.setQuantity(item.getQuantity());
                return allocItem;
            }).collect(Collectors.toList());
        allocationRequest.setItems(items);

        SalesOrder savedOrder = salesOrderRepositoryB2B.save(order);

        saveOutboxEvent(
            savedOrder.getOrderId(), 
            "SalesOrder", 
            "OrderApproved",    // Tên sự kiện
            allocationRequest   // Payload là DTO cho inventory-service
        );

        return savedOrder;
    }

    @Override
    @Transactional
    public SalesOrder shipB2BOrder(UUID orderId, ShipmentRequestDto shipmentRequest, String email) {
        SalesOrder order = salesOrderRepositoryB2B.findByOrderIdAndTypeOder(orderId, SaleOderType.B2B)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND)); 
            
        if (order.getOrderStatus() != OrderStatusB2B.CONFIRMED) {
            throw new AppException(ErrorCode.BAD_REQUEST); 
        }

        order.setOrderStatus(OrderStatusB2B.IN_TRANSIT);

        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(order)
                .status("ĐANG VẬN CHUYỂN")
                .updateDate(LocalDateTime.now())
                .notes("Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.")
                // .updatedBy(...) // Gán ID người thực hiện
                .build();
         if (order.getOrderTrackings() == null) {
              order.setOrderTrackings(new ArrayList<>());
         }
        order.getOrderTrackings().add(tracking);

        // 1. Lưu trạng thái đơn hàng
        SalesOrder savedOrder = salesOrderRepositoryB2B.save(order);

        // 2. Chuẩn bị payload cho sự kiện
        shipmentRequest.setOrderId(orderId);
        shipmentRequest.setDealerId(order.getDealerId());

        // 3. TẠO SỰ KIỆN OUTBOX
        saveOutboxEvent(
            savedOrder.getOrderId(), 
            "SalesOrder", 
            "OrderShipped",     // Tên sự kiện
            shipmentRequest     // Payload là DTO cho inventory-service
        );

        return savedOrder;
    }
    
    @Override
    @Transactional
    public SalesOrder confirmDelivery(UUID orderId, String email, UUID dealerId) {
        SalesOrder order = salesOrderRepositoryB2B.findByOrderIdAndTypeOder(orderId, SaleOderType.B2B)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND)); // Dùng constructor 1 tham số
            
        if (!order.getDealerId().equals(dealerId)) {
            throw new AppException(ErrorCode.FORBIDDEN); // Dùng constructor 1 tham số
        }
            
        if (order.getOrderStatus() != OrderStatusB2B.IN_TRANSIT) {
            throw new AppException(ErrorCode.BAD_REQUEST); // Dùng constructor 1 tham số
        }
        
        order.setOrderStatus(OrderStatusB2B.DELIVERED);
        order.setDeliveryDate(LocalDateTime.now());
        
        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(order)
                .status("ĐÃ GIAO THÀNH CÔNG")
                .updateDate(LocalDateTime.now())
                .notes("Đại lý đã xác nhận nhận hàng.")
                //.updatedBy(findStaffIdByEmail(email)) // ID của DEANER_MANAGER
                .build();
         if (order.getOrderTrackings() == null) {
             order.setOrderTrackings(new ArrayList<>());
         }
        order.getOrderTrackings().add(tracking);
        
        SalesOrder savedOrder = salesOrderRepositoryB2B.save(order);
        
        OrderDeliveredEvent eventPayload = new OrderDeliveredEvent(
            savedOrder.getOrderId(), 
            savedOrder.getDealerId(),
            savedOrder.getDeliveryDate()
        );
        
        saveOutboxEvent(
            savedOrder.getOrderId(), 
            "SalesOrder", 
            "OrderDelivered", 
            eventPayload
        );
        
        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SalesOrder> getAllB2BOrders(OrderStatusB2B status, Pageable pageable) {
        if (status != null) {
            return salesOrderRepositoryB2B.findAllByTypeOderAndOrderStatus(SaleOderType.B2B, status, pageable);
        } else {
            return salesOrderRepositoryB2B.findAllByTypeOder(SaleOderType.B2B, pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SalesOrder> getMyB2BOrders(UUID dealerId, OrderStatusB2B status, Pageable pageable) {
        
        // Cần dealerId để lọc
        if (dealerId == null) {
            // Ném lỗi nếu không xác định được đại lý (từ header)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (status != null) {
            // Trường hợp 1: Có lọc theo status
            return salesOrderRepositoryB2B.findAllByDealerIdAndTypeOderAndOrderStatus(dealerId, SaleOderType.B2B, status, pageable);
        } else {
            // Trường hợp 2: Không lọc, lấy tất cả đơn của đại lý đó
            return salesOrderRepositoryB2B.findAllByDealerIdAndTypeOder(dealerId, SaleOderType.B2B, pageable);
        }
    }

    @Override
    @Transactional
    public void cancelOrderByDealer(UUID orderId, String email, UUID dealerId) {
        SalesOrder order = findOrderByIdOrThrow(orderId);

        // Kiểm tra trạng thái
        if (order.getOrderStatus() != OrderStatusB2B.PENDING) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra quyền sở hữu
        if (!order.getDealerId().equals(dealerId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Thực hiện hủy
        performCancel(order, email);
    }

    @Override
    @Transactional
    public void cancelOrderByStaff(UUID orderId, String email) {
        SalesOrder order = findOrderByIdOrThrow(orderId);

        // Kiểm tra trạng thái
        if (order.getOrderStatus() != OrderStatusB2B.PENDING) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Staff/Admin có quyền hủy mọi đơn PENDING, không cần kiểm tra dealerId
        performCancel(order, email);
    }

    @Override
    @Transactional
    public void deleteCancelledOrder(UUID orderId) {
        SalesOrder order = salesOrderRepositoryB2B.findByOrderIdAndTypeOder(orderId, SaleOderType.B2B)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getOrderStatus() != OrderStatusB2B.CANCELLED) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        salesOrderRepositoryB2B.delete(order);
    }

    // --- CÁC HÀM HELPER ĐỂ LẤY HEADER ---

    /**
     * Xây dựng HttpHeaders bao gồm token và thông tin user từ request gốc.
     */
    private HttpHeaders buildHeadersFromCurrentRequest(String fallbackEmail) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpServletRequest currentRequest = getCurrentHttpRequest();
        if (currentRequest != null) {
            // 1. Chuyển tiếp Token (Quan trọng nhất)
            final String authHeader = currentRequest.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwtToken = authHeader.substring(7);
                headers.setBearerAuth(jwtToken);
                log.debug("Forwarding Bearer token.");
            } else {
                 log.warn("Original request is missing Bearer token. Cannot forward token.");
            }
            
            // 2. Chuyển tiếp các header X-User-*
            copyUserHeaders(currentRequest, headers);
            log.debug("Forwarding X-User-* headers: {}", headers);

        } else {
             log.warn("Could not get current HTTP request to forward headers. Using fallback email.");
             headers.set("X-User-Email", fallbackEmail); // Ít nhất thêm email
        }
        return headers;
    }

    /**
     * Lấy HttpServletRequest hiện tại một cách an toàn.
     */
    private HttpServletRequest getCurrentHttpRequest() {
        try {
             return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        } catch (IllegalStateException e) {
            log.warn("Not processing request within HTTP request context. Cannot retrieve original headers.");
            return null;
        }
    }

     /**
     * Sao chép các header X-User-* từ request gốc sang header mới.
     */
    private void copyUserHeaders(HttpServletRequest sourceRequest, HttpHeaders targetHeaders) {
         String userEmail = sourceRequest.getHeader("X-User-Email");
         String userRole = sourceRequest.getHeader("X-User-Role");
         String userId = sourceRequest.getHeader("X-User-Id");
         String userProfileId = sourceRequest.getHeader("X-User-ProfileId");

         if (userEmail != null) targetHeaders.set("X-User-Email", userEmail);
         if (userRole != null) targetHeaders.set("X-User-Role", userRole); // Quan trọng
         if (userId != null) targetHeaders.set("X-User-Id", userId);
         if (userProfileId != null) targetHeaders.set("X-User-ProfileId", userProfileId);
     }

    private SalesOrder findOrderByIdOrThrow(UUID orderId) {
        return salesOrderRepositoryB2B.findByOrderIdAndTypeOder(orderId, SaleOderType.B2B)
               .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    private void performCancel(SalesOrder order, String cancelledByEmail) {
        order.setOrderStatus(OrderStatusB2B.CANCELLED);
        // order.setCancelledBy(cancelledByEmail); // Tùy chọn
        
        salesOrderRepositoryB2B.save(order);

        OrderCancelledEvent eventPayload = new OrderCancelledEvent(
            order.getOrderId(), 
            cancelledByEmail, 
            LocalDateTime.now()
        );

        saveOutboxEvent(
            order.getOrderId(), 
            "SalesOrder", 
            "OrderCancelled", 
            eventPayload
        );
    }

    /**
     * HÀM HELPER MỚI: Dùng chung để lưu mọi sự kiện outbox
     * * @param aggregateId ID của đối tượng (ví dụ: orderId)
     * @param aggregateType Loại đối tượng (ví dụ: "SalesOrder")
     * @param eventType Tên sự kiện (ví dụ: "OrderApproved")
     * @param payloadObject Đối tượng DTO chứa dữ liệu sự kiện
     */
    private void saveOutboxEvent(UUID aggregateId, String aggregateType, String eventType, Object payloadObject) {
        try {
            // 1. Chuyển DTO thành chuỗi JSON
            String payload = objectMapper.writeValueAsString(payloadObject);
            String eventId = UUID.randomUUID().toString();

            // 2. Xây dựng đối tượng Outbox
            Outbox out = Outbox.builder()
                    .id(eventId)
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId.toString())
                    .eventType(eventType)
                    .payload(payload)
                    .status("NEW") // Trạng thái mới, chưa xử lý
                    .attempts(0)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            // 3. Lưu vào DB (nằm trong cùng transaction)
            outboxRepository.save(out);
            
        } catch (Exception e) {
            log.error("CRITICAL: Failed to create and save outbox event for {}: {}", eventType, aggregateId, e);
            // Ném lỗi này sẽ khiến toàn bộ transaction (cả việc lưu SalesOrder)
            // bị ROLLBACK, đảm bảo tính nhất quán (atomicity).
            throw new AppException(ErrorCode.DATABASE_ERROR);
        }
    }

}
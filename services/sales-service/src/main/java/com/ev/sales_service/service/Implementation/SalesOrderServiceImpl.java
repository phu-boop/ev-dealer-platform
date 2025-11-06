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
import com.ev.sales_service.enums.OrderStatus;

// import com.ev.sales_service.repository.QuotationRepository; 
import com.ev.sales_service.repository.OutboxRepository;
import com.ev.sales_service.repository.SalesOrderRepository;
import com.ev.sales_service.service.Interface.SalesOrderService;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.client.HttpClientErrorException;
// import org.springframework.web.client.HttpClientErrorException;
// import org.springframework.security.core.Authentication; 
// import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesOrderServiceImpl implements SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    // private final QuotationRepository quotationRepository; // Bỏ comment nếu bạn dùng logic báo giá
    private final RestTemplate restTemplate;

    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.services.catalog.url}")
    private String vehicleCatalogUrl;

    @Value("${app.services.inventory.url}")
    private String inventoryServiceUrl;

    private static final Logger log = LoggerFactory.getLogger(SalesOrderServiceImpl.class);

    @Override
    @Transactional
    public SalesOrder createB2BOrder(CreateB2BOrderRequest request, String email, UUID dealerId) {
        
        SalesOrder order = new SalesOrder();
        order.setDealerId(dealerId);
        order.setCustomerId(null); // B2B
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.PENDING);
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

        // Lưu đơn hàng vào DB
        SalesOrder savedOrder = salesOrderRepository.save(order);

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
    public SalesOrder approveB2BOrder(UUID orderId, String email) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

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

       try {
            String inventoryUrl = inventoryServiceUrl + "/inventory/allocate-sync"; 
            
            HttpHeaders headers = buildHeadersFromCurrentRequest(email); 
            HttpEntity<AllocationRequestDto> requestEntity = new HttpEntity<>(allocationRequest, headers);

            log.info("Đang gọi (SYNC) đến inventory-service (/allocate-sync) cho Order ID: {}", orderId);
            
            // GỌI API ĐỒNG BỘ
            restTemplate.exchange(
                inventoryUrl,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<ApiRespond<Void>>() {}
            );
            
            log.info("Gọi inventory-service (/allocate-sync) THÀNH CÔNG cho Order ID: {}", orderId);

        } catch (HttpClientErrorException e) {
            // LỖI TỪ INVENTORY-SERVICE (ví dụ: HẾT HÀNG)
            String errorMessage = e.getResponseBodyAsString();
            log.error("Lỗi (4xx) từ inventory-service khi đang phân bổ: {}", errorMessage, e);
            
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK); 

        } catch (Exception e) {
            // Lỗi 5xx, timeout...
            log.error("Lỗi (5xx) khi gọi inventory-service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

       // CẬP NHẬT TRẠNG THÁI VÀ LƯU
        order.setOrderStatus(OrderStatus.CONFIRMED);
        order.setManagerApproval(true);
        order.setApprovalDate(LocalDateTime.now());

        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(order)
                .status("ĐÃ TIẾP NHẬN ĐẶT XE") // Bạn có thể đổi thành "ĐÃ GIỮ HÀNG"
                .updateDate(LocalDateTime.now())
                .notes("EVM Staff (" + email + ") đã xác nhận đơn hàng và kho đã giữ hàng.") // <-- Ghi chú rõ hơn
                .build();
        if (order.getOrderTrackings() == null) {
             order.setOrderTrackings(new ArrayList<>());
        }
        order.getOrderTrackings().add(tracking);

        SalesOrder savedOrder = salesOrderRepository.save(order);


        return savedOrder;
    }

    @Override
    @Transactional
    public SalesOrder shipB2BOrder(UUID orderId, ShipmentRequestDto shipmentRequest, String email) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND)); 
                
        if (order.getOrderStatus() != OrderStatus.CONFIRMED) {
            // Đơn hàng phải được "CONFIRMED" (đã giữ hàng) mới được giao
            throw new AppException(ErrorCode.BAD_REQUEST); 
        }

        // 1. "LÀM GIÀU" (ENRICH) DTO 
        // -----------------------------------------------------------------
        shipmentRequest.setOrderId(orderId);
        shipmentRequest.setDealerId(order.getDealerId());

        log.info("Bắt đầu làm giàu DTO giao hàng cho Order ID: {}", orderId);
        for (ShipmentRequestDto.ShipmentItem item : shipmentRequest.getItems()) {
            
            String url = vehicleCatalogUrl + "/vehicle-catalog/variants/" + item.getVariantId();
            ResponseEntity<ApiRespond<VariantDetailDto>> response;
            try {
                response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null, 
                    new ParameterizedTypeReference<ApiRespond<VariantDetailDto>>() {}
                );
            } catch (Exception e) {
                log.error("Lỗi khi gọi vehicle-catalog service (cho variant {}): {}", item.getVariantId(), e.getMessage());
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE); 
            }

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().getData() == null) {
                log.error("Response không hợp lệ từ vehicle-catalog (cho variant {}): {}", item.getVariantId(), response.getStatusCode());
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE); 
            }
            
            VariantDetailDto variantDetails = response.getBody().getData();

            // Gán dữ liệu làm giàu
            item.setModelId(variantDetails.getModelId());
            item.setModelName(variantDetails.getModelName());
            item.setVariantName(variantDetails.getVersionName()); // Dùng versionName cho variantName
        }
        log.info("Làm giàu DTO giao hàng thành công.");
        // -----------------------------------------------------------------


        // 2. GỌI API ĐỒNG BỘ (SYNC CALL) ĐẾN INVENTORY-SERVICE
        // -----------------------------------------------------------------
        try {
            // Đây là endpoint /ship-b2b mà bạn đã có trong InventoryController
            String inventoryUrl = inventoryServiceUrl + "/inventory/ship-b2b"; 
            
            // Chuyển tiếp headers (chứa token, email, role...)
            HttpHeaders headers = buildHeadersFromCurrentRequest(email); 
            HttpEntity<ShipmentRequestDto> requestEntity = new HttpEntity<>(shipmentRequest, headers);

            log.info("Đang gọi (SYNC) đến inventory-service (ship-b2b) cho Order ID: {}", orderId);
            
            // GỌI API ĐỒNG BỘ
            restTemplate.exchange(
                inventoryUrl,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<ApiRespond<Void>>() {} // Mong đợi nhận về ApiRespond
            );
            
            log.info("Gọi inventory-service (ship-b2b) THÀNH CÔNG cho Order ID: {}", orderId);

        } catch (HttpClientErrorException e) {
            // === BẮT LỖI TỪ INVENTORY-SERVICE VÀ TRẢ VỀ FRONTEND ===
            // Đây là nơi lỗi "Xe VIN123 đã có ở kho" sẽ bị bắt
            String errorMessage = e.getResponseBodyAsString();
            log.error("Lỗi (4xx) từ inventory-service khi đang giao hàng: {}", errorMessage, e);
            
            // Ném lỗi này về lại Controller -> Frontend sẽ nhận được HTTP 400
            throw new AppException(ErrorCode.BAD_REQUEST); 

        } catch (Exception e) {
            // Bắt các lỗi khác (5xx, timeout, không kết nối được...)
            log.error("Lỗi (5xx) khi gọi inventory-service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }
        // -----------------------------------------------------------------


        // 3. CẬP NHẬT TRẠNG THÁI (Chỉ chạy nếu Bước 2 thành công)
        // -----------------------------------------------------------------
        order.setOrderStatus(OrderStatus.IN_TRANSIT);

        OrderTracking tracking = OrderTracking.builder()
                .salesOrder(order)
                .status("ĐANG VẬN CHUYỂN")
                .updateDate(LocalDateTime.now())
                .notes("Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.")
                // .updatedBy(...) 
                .build();
        
        if (order.getOrderTrackings() == null) {
              order.setOrderTrackings(new ArrayList<>());
        }
        order.getOrderTrackings().add(tracking);

        SalesOrder savedOrder = salesOrderRepository.save(order);

        // 4. --- BỎ OUTBOX ---
        // Chúng ta không cần lưu sự kiện "OrderShipped" vào Outbox nữa
        // vì luồng đã được xử lý đồng bộ.
        // saveOutboxEvent(...) // <-- BỎ DÒNG NÀY
        
        return savedOrder;
    }
    
    @Override
    @Transactional
    public SalesOrder confirmDelivery(UUID orderId, String email, UUID dealerId) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND)); // Dùng constructor 1 tham số
            
        if (!order.getDealerId().equals(dealerId)) {
            throw new AppException(ErrorCode.FORBIDDEN); // Dùng constructor 1 tham số
        }
            
        if (order.getOrderStatus() != OrderStatus.IN_TRANSIT) {
            throw new AppException(ErrorCode.BAD_REQUEST); // Dùng constructor 1 tham số
        }
        
        order.setOrderStatus(OrderStatus.DELIVERED);
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
        
        SalesOrder savedOrder = salesOrderRepository.save(order);
        
        List<OrderDeliveredEvent.OrderItemDetail> itemDetails = savedOrder.getOrderItems().stream()
        .map(orderItem -> OrderDeliveredEvent.OrderItemDetail.builder()
                .variantId(orderItem.getVariantId())
                .quantity(orderItem.getQuantity())
                .finalPrice(orderItem.getFinalPrice())
                .build())
        .collect(Collectors.toList());

        OrderDeliveredEvent eventPayload = OrderDeliveredEvent.builder()
                .orderId(savedOrder.getOrderId())
                .dealerId(savedOrder.getDealerId())
                .deliveryDate(savedOrder.getDeliveryDate())
                .totalAmount(savedOrder.getTotalAmount())
                .items(itemDetails)
                .build();
    
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
    public Page<SalesOrder> getAllB2BOrders(OrderStatus status, Pageable pageable) {
        if (status != null) {
            return salesOrderRepository.findAllByOrderStatus(status, pageable);
        } else {
            return salesOrderRepository.findAll(pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SalesOrder> getMyB2BOrders(UUID dealerId, OrderStatus status, Pageable pageable) {
        
        // Cần dealerId để lọc
        if (dealerId == null) {
            // Ném lỗi nếu không xác định được đại lý (từ header)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (status != null) {
            // Trường hợp 1: Có lọc theo status
            return salesOrderRepository.findAllByDealerIdAndOrderStatus(dealerId, status, pageable);
        } else {
            // Trường hợp 2: Không lọc, lấy tất cả đơn của đại lý đó
            return salesOrderRepository.findAllByDealerId(dealerId, pageable);
        }
    }

    @Override
    @Transactional
    public void cancelOrderByDealer(UUID orderId, String email, UUID dealerId) {
        SalesOrder order = findOrderByIdOrThrow(orderId);

        // Kiểm tra trạng thái
        if (order.getOrderStatus() != OrderStatus.PENDING) {
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
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Staff/Admin có quyền hủy mọi đơn PENDING, không cần kiểm tra dealerId
        performCancel(order, email);
    }

    @Override
    @Transactional
    public void deleteCancelledOrder(UUID orderId) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getOrderStatus() != OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        salesOrderRepository.delete(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesOrder> getCompletedOrdersForReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        return salesOrderRepository.findAllByOrderStatusAndDeliveryDateBetween(
            OrderStatus.DELIVERED, 
            startDateTime, 
            endDateTime
        );
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
        return salesOrderRepository.findById(orderId)
               .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    private void performCancel(SalesOrder order, String cancelledByEmail) {
        order.setOrderStatus(OrderStatus.CANCELLED);
        // order.setCancelledBy(cancelledByEmail); // Tùy chọn
        
        salesOrderRepository.save(order);

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

    private VariantDetailDto callCatalogService(Long variantId) {
        String url = vehicleCatalogUrl + "/vehicle-catalog/variants/" + variantId;
        ResponseEntity<ApiRespond<VariantDetailDto>> response = restTemplate.exchange(
            url, HttpMethod.GET, null, new ParameterizedTypeReference<ApiRespond<VariantDetailDto>>() {}
        );
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().getData() == null) {
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE); 
        }
        return response.getBody().getData();
    }

}
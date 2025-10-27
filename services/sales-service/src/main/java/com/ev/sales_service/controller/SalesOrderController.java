package com.ev.sales_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import jakarta.validation.Valid;

import com.ev.sales_service.enums.OrderStatus; // <<< THÊM IMPORT NÀY
import org.springframework.data.domain.Page; // <<< THÊM IMPORT NÀY
import org.springframework.data.domain.Pageable; // <<< THÊM IMPORT NÀY
import org.springframework.data.web.PageableDefault; // <<< THÊM IMPORT NÀY
import com.ev.common_lib.exception.AppException; // <<< THÊM IMPORT NÀY (nếu bạn dùng)
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.sales_service.dto.request.CreateB2BOrderRequest;
import com.ev.sales_service.dto.response.SalesOrderDto; 
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.mapper.SalesOrderMapper;
import com.ev.sales_service.service.Interface.SalesOrderService;

@RestController
@RequestMapping("/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    private final SalesOrderMapper salesOrderMapper;

    // API Tạo Đơn Hàng (Do Đại Lý Thực Hiện)
    // POST /sales-orders/b2b
    @PostMapping("/b2b")
    @PreAuthorize("hasRole('DEALER_MANAGER')") // Chỉ quản lý đại lý được đặt hàng
    public ResponseEntity<ApiRespond<SalesOrderDto>> createB2BOrder(
            @Valid @RequestBody CreateB2BOrderRequest request,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-ProfileId") UUID dealerId) {
        
        SalesOrder createdOrder = salesOrderService.createB2BOrder(request, email, dealerId);
        SalesOrderDto responseDto = salesOrderMapper.toDto(createdOrder); 
        
        return new ResponseEntity<>(
            ApiRespond.success("B2B order created", responseDto), 
            HttpStatus.CREATED
        );
    }

    // API Lấy Danh Sách Đơn Hàng (Do Hãng/EVM Staff Thực Hiện)
    // GET /sales-orders/b2b-admin?status=PENDING&page=0&size=10
    @GetMapping("/b2b")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Page<SalesOrderDto>>> getB2BOrders(
            @RequestParam(value = "status", required = false) String statusString,
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {
        
        // 1. Chuyển đổi String status sang Enum OrderStatus
        OrderStatus statusEnum = null;
        if (statusString != null && !statusString.isBlank()) {
            try {
                // Chuyển string (ví dụ "PENDING") thành enum (OrderStatus.PENDING)
                statusEnum = OrderStatus.valueOf(statusString.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Xử lý nếu client gửi status không hợp lệ (ví dụ: "PENDING_ABC")
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        // 2. Gọi service (đã làm ở bước 3)
        Page<SalesOrder> orderPage = salesOrderService.getAllB2BOrders(statusEnum, pageable);

        // 3. Map Page<Entity> sang Page<DTO> bằng cách dùng hàm .map()
        Page<SalesOrderDto> dtoPage = orderPage.map(salesOrderMapper::toDto);

        // 4. Trả về
        return ResponseEntity.ok(ApiRespond.success("Lấy danh sách đơn hàng thành công", dtoPage));
    }

    // API Xác Nhận Đơn Hàng (Do Hãng/EVM Staff Thực Hiện)
    // PUT /sales-orders/{orderId}/approve
    @PutMapping("/{orderId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> approveOrder(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Email") String email) {
        
        salesOrderService.approveB2BOrder(orderId, email);
        return ResponseEntity.ok(ApiRespond.success("Order approved and stock allocated", null));
    }

    // API Cập Nhật Trạng Thái Vận Chuyển (Do Hãng/EVM Staff Thực Hiện)
    // PUT /sales-orders/{orderId}/ship
    @PutMapping("/{orderId}/ship")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> shipOrder(
            @PathVariable UUID orderId,
            @Valid @RequestBody ShipmentRequestDto request,
            @RequestHeader("X-User-Email") String email) {
        
        // Truyền request (chứa VIN) xuống service
        salesOrderService.shipB2BOrder(orderId, request, email);
        return ResponseEntity.ok(ApiRespond.success("Order shipped", null));
    }

    @PutMapping("/{orderId}/deliver")
    @PreAuthorize("hasRole('DEALER_MANAGER')") // Chỉ quản lý đại lý được xác nhận
    public ResponseEntity<ApiRespond<Void>> deliverOrder(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-ProfileId") UUID dealerId) {
        
        salesOrderService.confirmDelivery(orderId, email, dealerId);
        return ResponseEntity.ok(ApiRespond.success("Order delivery confirmed", null));
    }
    
}

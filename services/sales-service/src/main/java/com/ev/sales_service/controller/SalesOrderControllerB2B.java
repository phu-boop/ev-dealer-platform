package com.ev.sales_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import java.util.List;

import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

import com.ev.sales_service.enums.OrderStatusB2B;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.sales_service.dto.request.CreateB2BOrderRequest;
import com.ev.sales_service.dto.request.ReportIssueRequest;
import com.ev.sales_service.dto.request.ResolveDisputeRequest;
import com.ev.sales_service.dto.response.SalesOrderDtoB2B;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.mapper.SalesOrderMapperB2B;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2B;

@RestController
@RequestMapping("/sales-orders")
@RequiredArgsConstructor
public class SalesOrderControllerB2B {

    private final SalesOrderServiceB2B salesOrderServiceB2B;

    private final SalesOrderMapperB2B salesOrderMapperB2B;

    // API Tạo Đơn Hàng (Do Đại Lý Thực Hiện)
    // POST /sales-orders/b2b
    @PostMapping("/b2b")
    @PreAuthorize("hasRole('DEALER_MANAGER')") // Chỉ quản lý đại lý được đặt hàng
    public ResponseEntity<ApiRespond<SalesOrderDtoB2B>> createB2BOrder(
                @Valid @RequestBody CreateB2BOrderRequest request,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-ProfileId") UUID dealerId) {

        SalesOrder createdOrder = salesOrderServiceB2B.createB2BOrder(request, email, dealerId);
        SalesOrderDtoB2B responseDto = salesOrderMapperB2B.toDto(createdOrder);

        return new ResponseEntity<>(
            ApiRespond.success("B2B order created", responseDto),
            HttpStatus.CREATED
        );
    }

    // Chỉ dành cho Staff, Admin tạo đơn hàng HỘ đại lý
    @PostMapping("/b2b/staff-placement")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<SalesOrderDtoB2B>> createB2BOrderByStaff(
            @Valid @RequestBody CreateB2BOrderRequest request,
            @RequestHeader("X-User-Email") String staffEmail) {

        UUID targetDealerId = request.getDealerId();
        if (targetDealerId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        SalesOrder createdOrder = salesOrderServiceB2B.createB2BOrder(request, staffEmail, targetDealerId);

        SalesOrderDtoB2B responseDto = salesOrderMapperB2B.toDto(createdOrder);

        return new ResponseEntity<>(
            ApiRespond.success("B2B order placed by staff successfully", responseDto),
            HttpStatus.CREATED
        );
    }

    // API Lấy Danh Sách Đơn Hàng (Do Hãng/EVM Staff Thực Hiện)
    // GET /sales-orders/b2b-admin?status=PENDING&page=0&size=10
    @GetMapping("/b2b")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Page<SalesOrderDtoB2B>>> getB2BOrders(
            @RequestParam(value = "status", required = false) String statusString,
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {

        // 1. Chuyển đổi String status sang Enum OrderStatus
        OrderStatusB2B statusEnum = null;
        if (statusString != null && !statusString.isBlank()) {
            try {
                // Chuyển string (ví dụ "PENDING") thành enum (OrderStatus.PENDING)
                statusEnum = OrderStatusB2B.valueOf(statusString.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Xử lý nếu client gửi status không hợp lệ (ví dụ: "PENDING_ABC")
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        // 2. Gọi service (đã làm ở bước 3)
        Page<SalesOrder> orderPage = salesOrderServiceB2B.getAllB2BOrders(statusEnum, pageable);

        // 3. Map Page<Entity> sang Page<DTO> bằng cách dùng hàm .map()
        Page<SalesOrderDtoB2B> dtoPage = orderPage.map(salesOrderMapperB2B::toDto);

        // 4. Trả về
        return ResponseEntity.ok(ApiRespond.success("Lấy danh sách đơn hàng thành công", dtoPage));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')") // Chỉ Staff/Admin được xem
    public ResponseEntity<ApiRespond<SalesOrderDtoB2B>> getB2BOrderDetails(
            @PathVariable UUID orderId) {

        SalesOrder order = salesOrderServiceB2B.getB2BOrderDetailsById(orderId);
        SalesOrderDtoB2B dto = salesOrderMapperB2B.toDto(order);

        return ResponseEntity.ok(ApiRespond.success("Lấy chi tiết đơn hàng thành công", dto));
    }

    // API Xác Nhận Đơn Hàng (Do Hãng/EVM Staff Thực Hiện)
    // PUT /sales-orders/{orderId}/approve
    @PutMapping("/{orderId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> approveOrder(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Email") String email) {

        salesOrderServiceB2B.approveB2BOrder(orderId, email);
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
        salesOrderServiceB2B.shipB2BOrder(orderId, request, email);
        return ResponseEntity.ok(ApiRespond.success("Order shipped", null));
    }

    // API Cập nhật nhận hàng từ đại lí
    @PutMapping("/{orderId}/deliver")
    @PreAuthorize("hasRole('DEALER_MANAGER')") // Chỉ quản lý đại lý được xác nhận
    public ResponseEntity<ApiRespond<Void>> deliverOrder(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-ProfileId") UUID dealerId) {

        salesOrderServiceB2B.confirmDelivery(orderId, email, dealerId);
        return ResponseEntity.ok(ApiRespond.success("Order delivery confirmed", null));
    }

    // API ĐẠI LÝ BÁO CÁO SỰ CỐ
    @PutMapping("/{orderId}/report-issue")
    @PreAuthorize("hasRole('DEALER_MANAGER')")
    public ResponseEntity<ApiRespond<Void>> reportIssue(
            @PathVariable UUID orderId,
            @Valid @RequestBody ReportIssueRequest request,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-ProfileId") UUID dealerId) {

        salesOrderServiceB2B.reportOrderIssue(orderId, dealerId, request, email);
        return ResponseEntity.ok(ApiRespond.success("Issue reported successfully", null));
    }

    @GetMapping("/my-orders")
    // Cho phép cả Manager và Staff xem đơn hàng
    @PreAuthorize("hasAnyRole('DEALER_MANAGER', 'DEALER_STAFF')")
    public ResponseEntity<ApiRespond<Page<SalesOrderDtoB2B>>> getMyB2BOrders(
            @RequestParam(value = "status", required = false) String statusString,
            // Lấy dealerId từ header (được Gateway thêm vào sau khi xác thực)
            @RequestHeader("X-User-ProfileId") UUID dealerId,
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {

        // 1. Chuyển đổi status (logic giống hệt GET /b2b)
        OrderStatusB2B statusEnum = null;
        if (statusString != null && !statusString.isBlank()) {
            try {
                statusEnum = OrderStatusB2B.valueOf(statusString.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        // 2. Gọi service và truyền dealerId (lấy từ header)
        Page<SalesOrder> orderPage = salesOrderServiceB2B.getMyB2BOrders(dealerId, statusEnum, pageable);

        // 3. Map sang DTO
        Page<SalesOrderDtoB2B> dtoPage = orderPage.map(salesOrderMapperB2B::toDto);

        // 4. Trả về
        return ResponseEntity.ok(ApiRespond.success("Lấy danh sách đơn hàng của đại lý thành công", dtoPage));
    }

    // --- API HỦY ĐƠN CHO DEALER ---
    @PutMapping("/{orderId}/cancel-by-dealer")
    @PreAuthorize("hasRole('DEALER_MANAGER')") // Chỉ Dealer Manager
    public ResponseEntity<ApiRespond<Void>> cancelOrderByDealer(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-ProfileId") UUID dealerId) { // ProfileId chính là dealerId của họ

        salesOrderServiceB2B.cancelOrderByDealer(orderId, email, dealerId);
        return ResponseEntity.ok(ApiRespond.success("Đơn hàng đã được hủy thành công", null));
    }

    // --- API HỦY ĐƠN CHO STAFF/ADMIN ---
    @PutMapping("/{orderId}/cancel-by-staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')") // Chỉ Admin hoặc Staff
    public ResponseEntity<ApiRespond<Void>> cancelOrderByStaff(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Email") String email) { // Chỉ cần email người hủy

        salesOrderServiceB2B.cancelOrderByStaff(orderId, email);
        return ResponseEntity.ok(ApiRespond.success("Đơn hàng đã được hủy thành công", null));
    }

    // API Xóa Đơn Hàng Đã Hủy
    // DELETE /sales-orders/{orderId}
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID orderId) {
        salesOrderServiceB2B.deleteCancelledOrder(orderId);
        // Trả về 204 No Content khi xóa thành công
        return ResponseEntity.noContent().build();
    }

    // // API Lấy Chi Tiết Đơn Hàng Theo OrderId
    // // GET /sales-orders/{orderId}
    // @GetMapping("/{orderId}")
    // @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF', 'CUSTOMER')")
    // public ResponseEntity<ApiRespond<SalesOrderDtoB2B>> getOrderById(@PathVariable UUID orderId) {
    //     SalesOrder order = salesOrderServiceB2B.getOrderById(orderId);
    //     SalesOrderDtoB2B responseDto = salesOrderMapperB2B.toDto(order);
    //     return ResponseEntity.ok(ApiRespond.success("Lấy chi tiết đơn hàng thành công", responseDto));
    // }

    // API lấy báo cáo doanh số theo khu vực đại lí
    @GetMapping("/b2b/report-completed")
    public ResponseEntity<ApiRespond<List<SalesOrder>>> getCompletedOrdersForReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<SalesOrder> orders = salesOrderServiceB2B.getCompletedOrdersForReport(startDate, endDate);
        return ResponseEntity.ok(ApiRespond.success("Lấy dữ liệu báo cáo thành công", orders));
    }

    //API GIẢI QUYẾT KHIẾU NẠI
    @PutMapping("/{orderId}/resolve-dispute")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<SalesOrderDtoB2B>> resolveDispute(
            @PathVariable UUID orderId,
            @Valid @RequestBody ResolveDisputeRequest request,
            @RequestHeader("X-User-Email") String staffEmail) {

        SalesOrder updatedOrder = salesOrderServiceB2B.resolveOrderDispute(orderId, staffEmail, request);
        SalesOrderDtoB2B responseDto = salesOrderMapperB2B.toDto(updatedOrder);

        return ResponseEntity.ok(ApiRespond.success("Đã giải quyết khiếu nại thành công", responseDto));
    }

}

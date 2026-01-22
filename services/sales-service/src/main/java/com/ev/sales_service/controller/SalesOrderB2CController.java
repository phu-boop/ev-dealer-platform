package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.OrderItemRequest;
import com.ev.sales_service.dto.response.SalesContractResponse;
import com.ev.sales_service.dto.response.SalesOrderB2CResponse;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2C;
import com.ev.common_lib.dto.respond.ApiRespond;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales-orders/b2c")
@RequiredArgsConstructor
@Slf4j
public class SalesOrderB2CController {

    private final SalesOrderServiceB2C salesOrderServiceB2C;

    /**
     * Admin/Staff lấy tất cả đơn hàng B2C với phân trang
     * GET /api/v1/sales-orders/b2c?status=PENDING&page=0&size=10
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<Page<SalesOrderB2CResponse>>> getAllB2COrders(
            @RequestParam(value = "status", required = false) String status,
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {
        
        log.info("Fetching all B2C sales orders with status: {} and pageable: {}", status, pageable);
        Page<SalesOrderB2CResponse> orderPage = salesOrderServiceB2C.getAllB2COrders(status, pageable);
        return ResponseEntity.ok(ApiRespond.success("Lấy danh sách đơn hàng B2C thành công", orderPage));
    }

    @PostMapping("/from-quotation/{quotationId}")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> createSalesOrderFromQuotation(@PathVariable UUID quotationId) {
        log.info("Converting quotation to B2C sales order: {}", quotationId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.createSalesOrderFromQuotation(quotationId);
        return ResponseEntity.ok(ApiRespond.success("Sales order created successfully", response));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> getSalesOrderById(@PathVariable UUID orderId) {
        log.info("Fetching B2C sales order by ID: {}", orderId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.getSalesOrderById(orderId);
        return ResponseEntity.ok(ApiRespond.success("Sales order fetched successfully", response));
    }

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<ApiRespond<List<SalesOrderB2CResponse>>> getSalesOrdersByDealer(@PathVariable UUID dealerId) {
        log.info("Fetching B2C sales orders for dealer: {}", dealerId);
        List<SalesOrderB2CResponse> responses = salesOrderServiceB2C.getSalesOrdersByDealer(dealerId);
        return ResponseEntity.ok(ApiRespond.success("Sales orders fetched successfully", responses));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiRespond<List<SalesOrderB2CResponse>>> getSalesOrdersByCustomer(@PathVariable Long customerId) {
        log.info("Fetching B2C sales orders for customer: {}", customerId);
        List<SalesOrderB2CResponse> responses = salesOrderServiceB2C.getSalesOrdersByCustomer(customerId);
        return ResponseEntity.ok(ApiRespond.success("Sales orders fetched successfully", responses));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> updateSalesOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status) {
        log.info("Updating B2C sales order status: {} to {}", orderId, status);
        SalesOrderB2CResponse response = salesOrderServiceB2C.updateSalesOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiRespond.success("Sales order status updated successfully", response));
    }

    @PutMapping("/{orderId}/approve")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> approveSalesOrder(
            @PathVariable UUID orderId,
            @RequestParam UUID managerId) {
        log.info("Approving B2C sales order: {} by manager: {}", orderId, managerId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.approveSalesOrder(orderId, managerId);
        return ResponseEntity.ok(ApiRespond.success("Sales order approved successfully", response));
    }

    @GetMapping("/{orderId}/model-id")
    public ResponseEntity<Long> getModelIdBySalesOrderId(@PathVariable UUID orderId) {
        Long modelId = salesOrderServiceB2C.getModelIdBySalesOrderId(orderId);
        return ResponseEntity.ok(modelId);
    }

    @PutMapping("/{orderId}/order-items")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> addOrderItemsToSalesOrder(
            @PathVariable UUID orderId) {
        log.info("Recalculating/adding order items for B2C sales order: {}", orderId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.addOrderItemsToSalesOrder(orderId);
        return ResponseEntity.ok(ApiRespond.success("Order items recalculated successfully", response));
    }

    /**
     * ✅ Manager hoặc khách hàng từ chối đơn hàng (APPROVED → REJECTED)
     */
    @PutMapping("/{orderId}/reject")
    public ResponseEntity<ApiRespond> rejectOrder(@PathVariable String orderId,
                                                  @RequestParam(required = false) String reason) {
        ApiRespond respond = salesOrderServiceB2C.rejectOrder(orderId, reason);
        return ResponseEntity.ok(respond);
    }


    @PostMapping("/{orderId}/convert-to-contract")
    public ResponseEntity<ApiRespond<SalesContractResponse>> convertToContract(
            @PathVariable UUID orderId) {

        log.info("Converting SalesOrder [{}] to contract...", orderId);

        // Service đã xử lý tất cả kiểm tra lỗi theo ErrorCode
        SalesContractResponse response = salesOrderServiceB2C.convertToContract(orderId);

        // Trả về ApiRespond với message và data
        return ResponseEntity.ok(
                ApiRespond.success("Tạo hợp đồng thành công từ đơn hàng đã xác nhận", response)
        );
    }


    @PostMapping("/{orderId}/complete")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> convertToComplete(
            @PathVariable UUID orderId) {

        // Service đã xử lý tất cả kiểm tra lỗi theo ErrorCode
        SalesOrderB2CResponse response = salesOrderServiceB2C.convertToComplete(orderId);

        // Trả về ApiRespond với message và data
        return ResponseEntity.ok(
                ApiRespond.success("Tạo hợp đồng thành công từ đơn hàng đã xác nhận", response)
        );
    }


    @PutMapping("/{orderId}/mark-edited")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> markOrderAsEdited(
            @PathVariable UUID orderId,
            @RequestParam UUID staffId) {
        log.info("Marking B2C sales order {} as EDITED by staff {}", orderId, staffId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.markOrderAsEdited(orderId, staffId);
        return ResponseEntity.ok(ApiRespond.success("Sales order marked as EDITED successfully", response));
    }


}
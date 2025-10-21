package com.ev.inventory_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
// import com.ev.common_lib.exception.AppException;
// import com.ev.common_lib.exception.ErrorCode;
import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.dto.response.InventoryStatusDto;
import com.ev.inventory_service.services.Interface.InventoryService;
import com.ev.inventory_service.model.InventoryTransaction;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
// import org.springframework.http.HttpStatus;

import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
// import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDate;
import java.io.IOException;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    /**
     * Lấy danh sách tồn kho phân trang, có thể lọc theo dealerId, status và tìm kiếm theo tên.
     */

    //phân quyền cấp thấp hơn
    //demo
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    @GetMapping
    public ResponseEntity<ApiRespond<Page<InventoryStatusDto>>> getAllInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long dealerId,
            @RequestParam(required = false) String status,
            Pageable pageable) {

        // Gọi đến service với đầy đủ tham số
        Page<InventoryStatusDto> results = inventoryService.getAllInventory(search, dealerId, status, pageable);
        return ResponseEntity.ok(ApiRespond.success("Fetched inventory successfully", results));
    }

    /**
     * Lấy trạng thái tồn kho chi tiết cho một phiên bản xe cụ thể.
     */
    @GetMapping("/{variantId}")
    public ResponseEntity<ApiRespond<InventoryStatusDto>> getInventoryStatusForVariant(@PathVariable Long variantId) {
        InventoryStatusDto status = inventoryService.getInventoryStatusForVariant(variantId);
        return ResponseEntity.ok(ApiRespond.success("Fetched inventory status for variant successfully", status));
    }

    /**
     * Thực hiện một giao dịch kho (nhập, xuất, điều chuyển...).
     */
    @PostMapping("/transactions")
    public ResponseEntity<ApiRespond<Void>> executeTransaction(
            @Valid @RequestBody TransactionRequestDto request,
            // LẤY THÔNG TIN TỪ HEADER 
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Role") String role, // Giả sử Gateway gửi role dưới dạng String
            @RequestHeader("X-User-ProfileId") String profileId) {
        
        // Truyền thông tin đã xác thực xuống service
        inventoryService.executeTransaction(request, email, role, profileId);
        return ResponseEntity.ok(ApiRespond.success("Transaction executed successfully", null));
    }

    /**
     * Xuất báo cáo tồn kho ra file Excel hoặc PDF.
     */
    @GetMapping("/report/export")
    public void exportInventoryReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "xlsx") String format, 
            HttpServletResponse response) throws IOException {

        if ("pdf".equalsIgnoreCase(format)) {
            // Logic xuất PDF
            response.setContentType("application/pdf");
            String headerValue = "attachment; filename=inventory_report_" + startDate + "_to_" + endDate + ".pdf";
            response.setHeader("Content-Disposition", headerValue);
            inventoryService.generatePdfReport(response.getOutputStream(), startDate, endDate);
        } else {
            // Logic xuất Excel
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            String headerValue = "attachment; filename=inventory_report_" + startDate + "_to_" + endDate + ".xlsx";
            response.setHeader("Content-Disposition", headerValue);
            inventoryService.generateInventoryReport(response.getOutputStream(), startDate, endDate);
        }
    }

    /**
     * Endpoint cho phép Đại lý tự cập nhật ngưỡng cảnh báo tồn kho.
     */
    @PutMapping("/dealer-stock/reorder-level")
    public ResponseEntity<ApiRespond<Void>> updateDealerReorderLevel(
            @Valid @RequestBody UpdateReorderLevelRequest request,
            @RequestHeader("X-User-ProfileId") Long dealerId) {
        
        inventoryService.updateDealerReorderLevel(dealerId, request);
          
        return ResponseEntity.ok(ApiRespond.success("Reorder level updated successfully", null));
    }

    /**
     * Endpoint cho phép EVM Staff cập nhật ngưỡng cảnh báo tồn kho trung tâm.
     */
    @PutMapping("/central-stock/reorder-level")
    public ResponseEntity<ApiRespond<Void>> updateCentralReorderLevel(
            @Valid @RequestBody UpdateReorderLevelRequest request,

            @RequestHeader("X-User-Email") String email) {
        
        // Gọi service chỉ với email
        inventoryService.updateCentralReorderLevel(request, email);
        return ResponseEntity.ok(ApiRespond.success("Central reorder level updated successfully", null));
    }

    /**
     * Lấy lịch sử các giao dịch kho, có phân trang.
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiRespond<Page<InventoryTransaction>>> getTransactionHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
                
        Page<InventoryTransaction> history = inventoryService.getTransactionHistory(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiRespond.success("Fetched transaction history", history));
    }
}

package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CancelTestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveFilterRequest;
import com.ev.customer_service.dto.request.TestDriveRequest;
import com.ev.customer_service.dto.request.UpdateTestDriveRequest;
import com.ev.customer_service.dto.response.ApiResponse;
import com.ev.customer_service.dto.response.TestDriveCalendarResponse;
import com.ev.customer_service.dto.response.TestDriveResponse;
import com.ev.customer_service.dto.response.TestDriveStatisticsResponse;
import com.ev.customer_service.service.TestDriveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller cho quản lý lịch hẹn lái thử xe
 * 
 * Roles:
 * - DEALER_STAFF: Có thể tạo, cập nhật, xem lịch hẹn
 * - DEALER_MANAGER: Có thể xem tất cả lịch hẹn, thống kê
 * - CUSTOMER: Có thể xem lịch hẹn của mình
 */
@RestController
@RequestMapping("/api/test-drives")
@RequiredArgsConstructor
public class TestDriveController {

    private final TestDriveService testDriveService;

    /**
     * Lấy danh sách lịch hẹn theo dealer
     */
    @GetMapping("/dealer/{dealerId}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> getTestDrivesByDealer(@PathVariable Long dealerId) {
        List<TestDriveResponse> appointments = testDriveService.getAppointmentsByDealerId(dealerId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    /**
     * Lấy chi tiết một lịch hẹn
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<TestDriveResponse>> getTestDriveById(@PathVariable Long id) {
        TestDriveResponse appointment = testDriveService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    /**
     * Tạo lịch hẹn lái thử mới
     * User Story 1: Dealer Staff tạo lịch hẹn cho khách hàng
     */
    @PostMapping
    @PreAuthorize("hasRole('DEALER_STAFF')")
    public ResponseEntity<ApiResponse<TestDriveResponse>> createTestDrive(
            @Valid @RequestBody TestDriveRequest request) {
        TestDriveResponse appointment = testDriveService.createAppointment(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test drive appointment created successfully", appointment));
    }

    /**
     * Cập nhật lịch hẹn lái thử
     * User Story 2: Dealer Staff cập nhật lịch hẹn
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DEALER_STAFF')")
    public ResponseEntity<ApiResponse<TestDriveResponse>> updateTestDrive(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTestDriveRequest request) {
        TestDriveResponse appointment = testDriveService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment updated successfully", appointment));
    }

    /**
     * Hủy lịch hẹn lái thử
     * User Story 2: Dealer Staff hủy lịch hẹn
     */
    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("hasRole('DEALER_STAFF')")
    public ResponseEntity<ApiResponse<Void>> cancelTestDrive(
            @PathVariable Long id,
            @Valid @RequestBody CancelTestDriveRequest request) {
        testDriveService.cancelAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment cancelled successfully", null));
    }

    /**
     * Xác nhận lịch hẹn
     */
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DEALER_STAFF')")
    public ResponseEntity<ApiResponse<Void>> confirmTestDrive(@PathVariable Long id) {
        testDriveService.confirmAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment confirmed successfully", null));
    }

    /**
     * Đánh dấu hoàn thành lịch hẹn
     */
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('DEALER_STAFF')")
    public ResponseEntity<ApiResponse<Void>> completeTestDrive(@PathVariable Long id) {
        testDriveService.completeAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment completed successfully", null));
    }

    /**
     * Filter lịch hẹn theo nhiều tiêu chí
     * User Story 3: Dealer Manager xem lịch với bộ lọc
     */
    @PostMapping("/filter")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> filterTestDrives(
            @Valid @RequestBody TestDriveFilterRequest filter) {
        List<TestDriveResponse> appointments = testDriveService.filterAppointments(filter);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    /**
     * Lấy lịch hẹn dạng Calendar View
     * User Story 3: Dealer Manager xem lịch dạng calendar
     */
    @GetMapping("/calendar")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<List<TestDriveCalendarResponse>>> getCalendarView(
            @RequestParam Long dealerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<TestDriveCalendarResponse> calendar = testDriveService.getCalendarView(dealerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(calendar));
    }

    /**
     * Lấy thống kê lịch hẹn
     * User Story 3: Dealer Manager xem thống kê
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<TestDriveStatisticsResponse>> getStatistics(
            @RequestParam Long dealerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        TestDriveStatisticsResponse statistics = testDriveService.getStatistics(dealerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}

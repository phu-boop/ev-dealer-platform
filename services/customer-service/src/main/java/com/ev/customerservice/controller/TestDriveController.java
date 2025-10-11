package com.ev.customerservice.controller;

import com.ev.customerservice.dto.request.TestDriveRequest;
import com.ev.customerservice.dto.response.ApiResponse;
import com.ev.customerservice.dto.response.TestDriveResponse;
import com.ev.customerservice.service.TestDriveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-drives")
@RequiredArgsConstructor
public class TestDriveController {

    private final TestDriveService testDriveService;

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> getTestDrivesByDealer(@PathVariable Long dealerId) {
        List<TestDriveResponse> appointments = testDriveService.getAppointmentsByDealerId(dealerId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TestDriveResponse>> getTestDriveById(@PathVariable Long id) {
        TestDriveResponse appointment = testDriveService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TestDriveResponse>> createTestDrive(@Valid @RequestBody TestDriveRequest request) {
        TestDriveResponse appointment = testDriveService.createAppointment(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test drive appointment created successfully", appointment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TestDriveResponse>> updateTestDrive(
            @PathVariable Long id,
            @Valid @RequestBody TestDriveRequest request) {
        TestDriveResponse appointment = testDriveService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment updated successfully", appointment));
    }
}

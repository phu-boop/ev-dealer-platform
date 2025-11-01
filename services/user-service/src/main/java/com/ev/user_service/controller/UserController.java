package com.ev.user_service.controller;

import com.ev.user_service.dto.request.ProfileRequest;
import com.ev.user_service.dto.request.UpdateProfileRequest;
import com.ev.user_service.dto.respond.ProfileRespond;
import com.ev.user_service.entity.User;
import com.ev.user_service.entity.UserDevice;
import com.ev.user_service.service.UserDeviceService;
import com.ev.user_service.validation.group.*;
import jakarta.validation.Valid;

import java.util.*;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.ev.user_service.dto.request.UserRequest;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.service.UserService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    private final UserService userService;
    private final UserDeviceService userDeviceService;

    UserController(
            UserService userService,
            UserDeviceService userDeviceService
    ) {
        this.userService = userService;
        this.userDeviceService = userDeviceService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiRespond<List<UserRespond>>> getAllUser() {
        return ResponseEntity.ok(
                ApiRespond.success("Get All User Successfully", userService.getAllUser())
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiRespond<UserRespond>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiRespond.success("Get User Successfully", userService.getUserById(id)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiRespond<UserRespond>> createUser(@Validated(OnCreate.class) @RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Create User Successfully", userService.createUser(userRequest)));
    }

    @PostMapping("/register/dealerStaff")
    public ResponseEntity<ApiRespond<UserRespond>> createUserDealerStaff(@Validated(OnCreateDealerStaff.class) @RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Create User Successfully", userService.createUserDealerStaff(userRequest)));
    }

    @PostMapping("/register/evmStaff")
    public ResponseEntity<ApiRespond<UserRespond>> createUserEvmStaff(@Validated(OnCreateEvmStaff.class) @RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Create User Successfully", userService.createUserEvmStaff(userRequest)));
    }


     @PostMapping("/register/dealerManager")
    public ResponseEntity<ApiRespond<UserRespond>> createUserDealerManager(@Validated(OnCreateDealerManager.class) @RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Create User Successfully", userService.createUserDealerStaff(userRequest)));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiRespond<UserRespond>> createUserAdmin(@Validated(OnCreate.class) @RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Create User Successfully", userService.createUserEvmStaff(userRequest)));
    }


    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiRespond<UserRespond>> updateUser(
            @PathVariable UUID id,
            @Validated(OnUpdate.class) @Valid @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(
                ApiRespond.success("Update User Successfully", userService.updateUser(id, userRequest))
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRespond<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiRespond.success("Delete User Successfully", null));
    }

    @PostMapping("/{userId}/fcm-token")
    public ResponseEntity<ApiRespond<Void>> saveFCMToken(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body
    ) {
        String message = userDeviceService.saveFCMToken(userId, body);
        return ResponseEntity.ok(ApiRespond.success(message,null));
    }

    //xem chi tiết profile
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER', 'EVM_STAFF')")
    @PostMapping("/profile")
    public ResponseEntity<ApiRespond<ProfileRespond>> getCurrentProfileRespond(@RequestBody ProfileRequest request) {
        ProfileRespond profileRespond = userService.getCurrentProfileByIdUser(request.getId_user());
        return ResponseEntity.ok(ApiRespond.success("Get profile successfully", profileRespond));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER', 'EVM_STAFF')")
    @PutMapping("/profile")
    public ResponseEntity<ApiRespond<?>> updateProfile(
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiRespond.success("Update successfully!",userService.updateProfile(request)));
    }

    //mockData
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        Map<String, Object> data = new LinkedHashMap<>();

        // ✅ Fake tổng quan
        data.put("totalUsers", 1500);
        data.put("activeUsers", 1200);
        data.put("inactiveUsers", 300);
        data.put("newUsersThisMonth", 85);

        // ✅ Fake thống kê theo vai trò
        Map<String, Long> byRole = new LinkedHashMap<>();
        byRole.put("ADMIN", 5L);
        byRole.put("DEALER_MANAGER", 20L);
        byRole.put("DEALER_STAFF", 60L);
        byRole.put("CUSTOMER", 1415L);
        data.put("usersByRole", byRole);

        // ✅ Fake thống kê theo tháng (dùng cho biểu đồ)
        List<Map<String, Object>> monthlyStats = new ArrayList<>();
        monthlyStats.add(Map.of("month", "2025-06", "count", 120));
        monthlyStats.add(Map.of("month", "2025-07", "count", 98));
        monthlyStats.add(Map.of("month", "2025-08", "count", 150));
        monthlyStats.add(Map.of("month", "2025-09", "count", 200));
        monthlyStats.add(Map.of("month", "2025-10", "count", 85));
        data.put("registrationsByMonth", monthlyStats);

        return ResponseEntity.status(HttpStatus.OK).body(data);
    }
}
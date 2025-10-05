package com.ev.vehicle_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class VehicleController {

    @GetMapping("/vehicles/test")
    public Map<String, Object> testVehicleEndpoint(
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "🚗 Vehicle service is working correctly!");
        response.put("email", email);
        response.put("role", role);
        response.put("userId", userId);
        return response;
    }
}

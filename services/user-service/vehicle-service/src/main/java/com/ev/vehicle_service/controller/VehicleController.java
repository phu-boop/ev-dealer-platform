package com.ev.vehicle_service.controller;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
public class VehicleController {

    @GetMapping("/vehicles")
    public String getVehicles() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        // Kiểm tra quyền
        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        // Trả data mẫu
        return "Hello " + email + ", bạn có quyền truy cập vehicles!";
    }
}


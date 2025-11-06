package com.ev.customer_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Helper service để lấy thông tin vehicle và staff từ các service khác
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentDataService {

    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:8081/users}")
    private String userServiceUrl;

    @Value("${vehicle.service.url:http://localhost:8080/vehicles/vehicle-catalog}")
    private String vehicleServiceUrl;

    /**
     * Lấy tên mẫu xe từ modelId
     * Format: "VF 3", "VF 9"
     */
    public String getVehicleModelName(Long modelId, Long variantId) {
        try {
            // Gọi Vehicle Service: GET /vehicles/vehicle-catalog/models/{modelId}
            String url = vehicleServiceUrl + "/models/" + modelId;
            log.info("🔍 Fetching model from: {}", url);
            
            log.debug("Calling VehicleService for model: {} -> {}", modelId, url);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            log.debug("VehicleService model response for modelId {}: {}", modelId, response);
            log.info("📦 Vehicle API response: {}", response);
            
            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> modelData = (Map<String, Object>) response.get("data");
                String modelName = (String) modelData.get("modelName");
                
                log.info("✅ Model name from API: {}", modelName);
                
                if (modelName != null) {
                    return modelName;
                }
            }
            
            log.warn("⚠️ Using fallback for model {}", modelId);
            return getVehicleModelNameFallback(modelId, variantId);
        } catch (Exception e) {
            log.error("❌ Failed to fetch vehicle model name for model {}: {}", modelId, e.getMessage());
            return getVehicleModelNameFallback(modelId, variantId);
        }
    }

    /**
     * Lấy tên phiên bản xe với màu sắc
     * Format: "Plus (Jet Black)"
     */
    public String getVehicleVariantName(Long modelId, Long variantId) {
        if (variantId == null) {
            log.info("⚠️ VariantId is null, returning empty string");
            return "";
        }
        
        try {
            // Gọi Vehicle Service: GET /vehicles/vehicle-catalog/variants/{variantId}
            String url = vehicleServiceUrl + "/variants/" + variantId;
            log.info("🔍 Fetching variant from: {}", url);
            
            log.debug("Calling VehicleService for variant: {} -> {}", variantId, url);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            log.debug("VehicleService variant response for variantId {}: {}", variantId, response);
            log.info("📦 Variant API response: {}", response);
            
            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> variantData = (Map<String, Object>) response.get("data");
                
                String versionName = (String) variantData.get("versionName");
                String color = (String) variantData.get("color");
                
                log.info("✅ Variant from API - Version: {}, Color: {}", versionName, color);
                
                if (versionName != null && color != null) {
                    return versionName + " (" + color + ")";
                } else if (versionName != null) {
                    return versionName;
                } else if (color != null) {
                    return "(" + color + ")";
                }
            }
            
            log.warn("⚠️ Using fallback for variant {}", variantId);
            return getVehicleVariantNameFallback(variantId);
        } catch (Exception e) {
            log.error("❌ Failed to fetch vehicle variant name for variant {}: {}", variantId, e.getMessage());
            return getVehicleVariantNameFallback(variantId);
        }
    }

    /**
     * Lấy đầy đủ thông tin xe: "VF 3 - Standard (Jelly Green)"
     */
    public String getFullVehicleInfo(Long modelId, Long variantId) {
        try {
            String modelName = getVehicleModelName(modelId, variantId);
            String variantName = getVehicleVariantName(modelId, variantId);
            
            if (variantName != null && !variantName.isEmpty() && !variantName.equals("Unknown")) {
                return modelName + " - " + variantName;
            }
            return modelName;
        } catch (Exception e) {
            log.warn("Failed to get full vehicle info", e);
            return "Model #" + modelId;
        }
    }

    /**
     * Lấy tên nhân viên từ staffId
     * Format: "Nguyễn Văn A (staff@dealer.com)"
     */
    public String getStaffName(String staffId) {
        if (staffId == null || staffId.isEmpty()) {
            return "Chưa phân công nhân viên";
        }

        try {
            // Gọi User Service internal endpoint
            String url = userServiceUrl + "/internal/" + staffId;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userData = (Map<String, Object>) response.get("data");
                
                String name = (String) userData.get("name");
                String email = (String) userData.get("email");
                
                if (name != null) {
                    if (email != null) {
                        return name + " (" + email + ")";
                    }
                    return name;
                }
                
                if (email != null) {
                    return "Staff (" + email + ")";
                }
            }
            
            return getStaffNameFallback(staffId);
        } catch (Exception e) {
            log.warn("Failed to fetch staff name for staff {}", staffId, e);
            return getStaffNameFallback(staffId);
        }
    }

    // ==================== Fallback Methods ====================

    /**
     * Fallback khi không lấy được tên xe từ service
     */
    private String getVehicleModelNameFallback(Long modelId, Long variantId) {
        // Có thể map một số model ID phổ biến
        return switch (modelId.intValue()) {
            case 1 -> "VF 3";
            case 2 -> "VF 5";
            case 3 -> "VF 6";
            case 4 -> "VF 7";
            case 5 -> "VF 8";
            case 6 -> "VF 9";
            default -> "Model #" + modelId;
        };
    }

    /**
     * Fallback khi không lấy được tên variant
     */
    private String getVehicleVariantNameFallback(Long variantId) {
        if (variantId == null) {
            return "Standard";
        }
        // Có thể map một số variant ID phổ biến
        return switch (variantId.intValue()) {
            case 1 -> "Standard";
            case 2 -> "Plus";
            case 3 -> "Pro";
            case 4 -> "Premium";
            default -> "Variant #" + variantId;
        };
    }

    /**
     * Fallback khi không lấy được tên staff
     */
    private String getStaffNameFallback(String staffId) {
        return "Staff ID: " + staffId;
    }
}

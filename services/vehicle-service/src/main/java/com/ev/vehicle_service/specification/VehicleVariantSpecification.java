package com.ev.vehicle_service.specification;

import com.ev.vehicle_service.model.VehicleVariant;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import com.ev.vehicle_service.model.*;

public class VehicleVariantSpecification {

    public static Specification<VehicleVariant> hasColor(String color) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("color")), "%" + color.toLowerCase() + "%");
    }

    public static Specification<VehicleVariant> hasVersionName(String versionName) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("versionName")), "%" + versionName.toLowerCase() + "%");
    }

    public static Specification<VehicleVariant> hasKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null; // Trả về null nếu không có gì để tìm
        }
    
        // Nếu có keyword, trả về Specification
        return (root, query, cb) -> {
            String likePattern = "%" + keyword.toLowerCase() + "%";
            Join<VehicleVariant, VehicleModel> modelJoin = root.join("vehicleModel");
            return cb.or(
                cb.like(cb.lower(modelJoin.get("modelName")), likePattern),
                cb.like(cb.lower(root.get("versionName")), likePattern),
                cb.like(cb.lower(root.get("color")), likePattern)
            );
        };
    }
    
}

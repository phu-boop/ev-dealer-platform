package com.ev.vehicle_service.model;

import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
// import lombok.Data;
import lombok.Getter;
import lombok.Setter;
// import lombok.EqualsAndHashCode;
// import lombok.ToString;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vehicle_models")
@Getter // Thêm và getter để tránh vòng lặp
@Setter // Thêm và setter để tránh vòng lặp
// @EqualsAndHashCode(exclude = {"features", "priceHistories"}) // Thêm và loại trừ để tránh vòng lặp
// @ToString(exclude = {"features", "priceHistories"}) // Thêm và loại trừ để tránh vòng lặp
public class VehicleModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    private String brand;

    // Lưu trữ dưới dạng chuỗi JSON
    @Column(name = "specifications_json", columnDefinition = "json")
    private String specificationsJson;

    @Column(name = "created_by")
    // private Long createdBy; // Giả sử là ID của User 
    private String createdBy; // Email của user (tạm thời)

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_by")
    private String updatedBy; // Để lưu email người cập nhật/xóa

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate; // Tự động cập nhật thời gian

    // --- Relationships ---
    // <<< Mối quan hệ mới: Một Model có nhiều Variants >>>
    @OneToMany(mappedBy = "vehicleModel", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VehicleVariant> variants = new HashSet<>();

}

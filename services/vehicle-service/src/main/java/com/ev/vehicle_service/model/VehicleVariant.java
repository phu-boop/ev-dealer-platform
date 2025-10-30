package com.ev.vehicle_service.model;

import com.ev.common_lib.model.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
// import org.hibernate.annotations.UpdateTimestamp;


@Entity
@Table(name = "vehicle_variants")
@Getter
@Setter
public class VehicleVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;
    
    // Mối quan hệ ngược lại: Nhiều Variants thuộc về một Model 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private VehicleModel vehicleModel;

    @Column(name = "version_name")
    private String versionName;

    private String color;
    
    @Column(name = "sku_code", unique = true) // Mã định danh sản phẩm
    private String skuCode;

    @Column(name = "battery_capacity")
    private Integer batteryCapacity;

    @Column(name = "charging_time")
    private Float chargingTime;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "motor_power")
    private Integer motorPower;

    private BigDecimal price;

    @Column(name = "wholesale_price")
    private BigDecimal wholesalePrice;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;

    // --- Audit Fields ---
    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "image_url")
    private String imageUrl;
    
    // ... updatedBy, updatedDate ...

    // --- Relationships (đã được di chuyển) ---
    @OneToMany(mappedBy = "vehicleVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PriceHistory> priceHistories = new HashSet<>();

    @OneToMany(mappedBy = "vehicleVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VariantFeature> features = new HashSet<>();
}
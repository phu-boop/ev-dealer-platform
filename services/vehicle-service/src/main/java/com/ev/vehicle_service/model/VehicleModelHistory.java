package com.ev.vehicle_service.model;

import com.ev.vehicle_service.model.Enum.EVMAction;
import com.ev.vehicle_service.model.Enum.VehicleStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_model_history")
@Data
public class VehicleModelHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @Column(nullable = false)
    private Long modelId; // ID của VehicleModel gốc

    @Enumerated(EnumType.STRING) 
    @Column(name = "action", nullable = false)
    private EVMAction action;// "CREATE", "UPDATE", "DELETE"

    @Column(nullable = false)
    private LocalDateTime actionDate; // Thời gian thực hiện

    @Column(nullable = false)
    private String changedBy; // Email của người thực hiện

    // --- Các trường dữ liệu tại thời điểm thay đổi ---
    private String modelName;
    private String brand;
    private String version;
    private BigDecimal basePrice;
    private VehicleStatus status;
    // ... Sao chép các trường quan trọng khác từ VehicleModel mà bạn muốn lưu lại ...
}

package com.example.reporting_service.model;

import jakarta.persistence.*;
import java.sql.Timestamp;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "inventory_summary_by_region")
@Data // Tự động tạo getters, setters, toString, equals/hashCode 
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryByRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String modelId;
    private String modelName;
    
    @Column(nullable = false)
    private String variantId;
    private String variantName;
    
    @Column(nullable = false)
    private String region;
    
    private int totalStock;
    
    @Column(name = "last_updated_at")
    private Timestamp lastUpdatedAt;
}
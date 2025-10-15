package com.ev.sales_service.entity;

import com.ev.sales_service.enums.PromotionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "promotion_id", columnDefinition = "BINARY(16)")
    private UUID promotionId;

    @Column(name = "promotion_name", length = 255, nullable = false)
    private String promotionName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "discount_rate", precision = 5, scale = 2)
    private BigDecimal discountRate;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "applicable_models_json", columnDefinition = "JSON")
    private String applicableModelsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private PromotionStatus status;

    @ManyToMany
    @JoinTable(
        name = "quotation_promotions",
        joinColumns = @JoinColumn(name = "promotion_id"),
        inverseJoinColumns = @JoinColumn(name = "quotation_id")
    )
    private Set<Quotation> quotations;
}

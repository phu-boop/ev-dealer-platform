package com.ev.sales_service.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quotation_id")
    private Long quotationId;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @Column(name = "quotation_date")
    private LocalDateTime quotationDate;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "base_price", precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "final_price", precision = 15, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;

    @Column(name = "status", length = 50)
    private String status;

    @OneToOne(mappedBy = "quotation")
    private SalesOrder salesOrder;

    @ManyToMany(mappedBy = "quotations")
    private java.util.Set<Promotion> promotions;
}

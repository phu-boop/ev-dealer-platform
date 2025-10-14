package com.ev.sales_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long contractId;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder salesOrder;

    @Column(name = "contract_date")
    private LocalDateTime contractDate;

    @Column(name = "contract_terms", columnDefinition = "TEXT")
    private String contractTerms;

    @Column(name = "signing_date")
    private LocalDateTime signingDate;

    @Column(name = "contract_status", length = 50)
    private String contractStatus;

    @Column(name = "digital_signature", columnDefinition = "TEXT")
    private String digitalSignature;

    @Column(name = "contract_file_url")
    private String contractFileUrl;
}
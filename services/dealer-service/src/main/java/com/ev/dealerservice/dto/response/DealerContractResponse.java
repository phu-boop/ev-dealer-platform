package com.ev.dealerservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerContractResponse {

    private Long contractId;
    private Long dealerId;
    private String dealerName;
    private String contractNumber;
    private String contractTerms;
    private BigDecimal targetSales;
    private BigDecimal commissionRate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String contractStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

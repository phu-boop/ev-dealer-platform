    package com.ev.sales_service.dto.request;

    import lombok.Data;

    import java.time.LocalDateTime;
    import java.util.UUID;

    @Data
    public class SalesContractRequest {
        private UUID orderId;
        private LocalDateTime contractDate;
        private LocalDateTime signingDate;
        private String contractTerms;
        private String digitalSignature;
        private String contractFileUrl;
        private String contractNumber;
    }
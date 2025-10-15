package com.ev.inventory_service.dto.request;

import com.ev.inventory_service.model.Enum.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransactionRequestDto {

    @NotNull
    private TransactionType transactionType;

    @NotNull
    private Long variantId;

    @NotNull
    @Min(1)
    private Integer quantity; // Số lượng xe cần chuyển

    private Long fromDealerId; // Cần thiết cho các giao dịch điều chuyển
    private Long toDealerId;   // Cần thiết cho các giao dịch điều chuyển

    private String notes;
    private String staffId;
    private String referenceId; // Id của phiếu xuất/ nhập kho
}

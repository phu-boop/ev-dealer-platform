package com.ev.sales_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;    
import lombok.AllArgsConstructor;

import java.util.List;

@Data
public class CreateB2BOrderRequest {

    @Valid
    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    private List<Item> items;

    @Data
    @NoArgsConstructor    
    @AllArgsConstructor
    public static class Item {
        
        @NotNull(message = "variantId là bắt buộc")

        private Long variantId; 

        @NotNull
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer quantity;
    }
}

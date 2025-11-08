package com.ev.sales_service.dto.response;

import lombok.Data;

// DTO này dùng để hứng cấu trúc ApiRespond chung
@Data
public class ApiRespondDTO<T> {
    private String code;
    private String message;
    private T data; // Dữ liệu chúng ta cần nằm ở đây
}
package com.freelancehub.common_lib.dto.respond;


import com.freelancehub.common_lib.exception.ErrorCode;
import org.jetbrains.annotations.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiRespond<T> {
    String code;
    String message;
    @Nullable
    T data;

    public static <T> ApiRespond<T> success(String message, T data) {
        return new ApiRespond<>(ErrorCode.SUCCESS.getCode(), message, data);
    }
}


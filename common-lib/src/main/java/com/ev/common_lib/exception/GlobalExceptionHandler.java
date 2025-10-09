package com.ev.common_lib.exception;

import com.ev.common_lib.dto.respond.ApiRespond;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Optional;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiRespond<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex){
        ApiRespond<?> apiRespond = new ApiRespond<>();
        String defaultMsg = Optional.ofNullable(ex.getBindingResult().getFieldError())
            .map(FieldError::getDefaultMessage)
            .orElse("VALIDATION_ERROR");
        ErrorCode errorCode;
        try {
            errorCode = ErrorCode.valueOf(defaultMsg);
        } catch (IllegalArgumentException e) {
            errorCode = ErrorCode.VALIDATION_ERROR;
        }
        apiRespond.setCode(errorCode.getCode());
        apiRespond.setMessage(errorCode.getMessage());
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(apiRespond);
    }
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiRespond<?>> handleAppException(AppException ex){
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ex.getErrorCode().getCode());
        apiRespond.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(apiRespond);
    }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiRespond<?>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex){
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ErrorCode.METHOD_NOT_ALLOWED.getCode());
        apiRespond.setMessage(ErrorCode.METHOD_NOT_ALLOWED.getMessage());
        return ResponseEntity
            .status(ErrorCode.METHOD_NOT_ALLOWED.getHttpStatus())
            .body(apiRespond);
    }
     @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiRespond<?>> handleAccessDenied(AccessDeniedException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ErrorCode.UNAUTHORIZED.getCode());
        apiRespond.setMessage(ErrorCode.UNAUTHORIZED.getMessage());
        return ResponseEntity
                .status(ErrorCode.UNAUTHORIZED.getHttpStatus())
                .body(apiRespond);
    }
<<<<<<< HEAD
=======

>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
}

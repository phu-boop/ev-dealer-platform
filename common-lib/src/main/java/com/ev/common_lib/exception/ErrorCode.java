package com.ev.common_lib.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    //
    SUCCESS("1000", "Success", HttpStatus.OK),

    // ===== 2xxx - Client errors =====
    VALIDATION_ERROR("2001", "Validation failed", HttpStatus.BAD_REQUEST),
    BAD_REQUEST("2002", "Bad request", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED("2003", "HTTP method not allowed", HttpStatus.METHOD_NOT_ALLOWED),
    UNSUPPORTED_MEDIA_TYPE("2004", "Unsupported media type", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    MISSING_REQUIRED_FIELD("2005", "Missing required field", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL_FORMAT("2006", "Email format is invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_SHORT("2007", "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID_FORMAT("2008", "Password must include uppercase, lowercase, number, and special character", HttpStatus.BAD_REQUEST),
    AGE_TOO_YOUNG("2009", "User must be at least 18 years old", HttpStatus.BAD_REQUEST),
    PHONE_INVALID_FORMAT("2010", "Phone number must be 10-12 digits", HttpStatus.BAD_REQUEST),
    TOO_MANY_REQUESTS("2011", "Too many requests", HttpStatus.TOO_MANY_REQUESTS),
    INVALID_DATE_FUTURE("2012", "Date must be in the future", HttpStatus.BAD_REQUEST),
    INVALID_DISCOUNT_RANGE("2013", "Discount rate must be between 0 and 100", HttpStatus.BAD_REQUEST),
    INVALID_PRICE("2014", "Price must be greater than 0", HttpStatus.BAD_REQUEST),
    MISSING_TERMS_CONDITIONS("2015", "Terms and conditions are required", HttpStatus.BAD_REQUEST),
    VALID_UNTIL_REQUIRED("2016", "Valid until date is required", HttpStatus.BAD_REQUEST),
    VALID_UNTIL_FUTURE("2017", "Valid until must be in the future", HttpStatus.BAD_REQUEST),
    TERMS_CONDITIONS_REQUIRED("2018", "Terms conditions are required", HttpStatus.BAD_REQUEST),
    DEALER_ID_REQUIRED("2019", "Dealer ID is required", HttpStatus.BAD_REQUEST),
    CUSTOMER_ID_REQUIRED("2020", "Customer ID is required", HttpStatus.BAD_REQUEST),
    MODEL_ID_REQUIRED("2021", "Model ID is required", HttpStatus.BAD_REQUEST),
    VARIANT_ID_REQUIRED("2022", "Variant ID is required", HttpStatus.BAD_REQUEST),
    STAFF_ID_REQUIRED("2023", "Staff ID is required", HttpStatus.BAD_REQUEST),
    BASE_PRICE_REQUIRED("2024", "Base price is required", HttpStatus.BAD_REQUEST),
    BASE_PRICE_POSITIVE("2025", "Base price must be greater than 0", HttpStatus.BAD_REQUEST),
    DISCOUNT_RATE_MAX("2026", "Discount rate cannot exceed 100%", HttpStatus.BAD_REQUEST),
    DISCOUNT_RATE_MIN("2027", "Discount rate cannot be negative", HttpStatus.BAD_REQUEST),
    INVALID_UUID_FORMAT("2028", "Invalid UUID format", HttpStatus.BAD_REQUEST),

    // ===== 3xxx - Server errors =====
    INTERNAL_ERROR("3001", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("3002", "Service unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    TIMEOUT("3003", "Request timeout", HttpStatus.REQUEST_TIMEOUT),
    DOWNSTREAM_SERVICE_UNAVAILABLE("3004", "A downstream service is currently unavailable", HttpStatus.SERVICE_UNAVAILABLE),

    // ===== 4xxx - Auth & Authorization =====
    UNAUTHORIZED("4001", "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("4002", "Access denied", HttpStatus.FORBIDDEN),
    TOKEN_EXPIRED("4003", "Token expired", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("4004", "Invalid token", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED("4005", "Account is locked", HttpStatus.FORBIDDEN),
    TOKEN_LOGGED_OUT("4006", "Token logged out", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN("4007", "Invalid refresh token", HttpStatus.UNAUTHORIZED),
    RECAPTCHA_FAILED("4008", "reCAPTCHA verification failed", HttpStatus.FORBIDDEN),

    // ===== 5xxx - Data & DB errors =====
    USER_NOT_FOUND("5001", "User not found", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("5002", "Email already exists", HttpStatus.CONFLICT),
    PHONE_ALREADY_EXISTS("5003", "Phone number already exists", HttpStatus.CONFLICT),
    DATA_NOT_FOUND("5004", "Data not found", HttpStatus.NOT_FOUND),
    DATA_ALREADY_EXISTS("5005", "Data already exists", HttpStatus.CONFLICT),
    DATABASE_ERROR("5006", "Database error", HttpStatus.INTERNAL_SERVER_ERROR),
    CONSTRAINT_VIOLATION("5007", "Database constraint violation", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD("5008", "Invalid password", HttpStatus.BAD_REQUEST),
    INVALID_JSON_FORMAT("5009", "Invalid json format", HttpStatus.BAD_REQUEST),
    DEALER_MANAGER_ALREADY_EXISTS("5010", "Dealer already has a manager", HttpStatus.BAD_REQUEST),
    QUOTATION_NOT_FOUND("5011", "Quotation not found", HttpStatus.NOT_FOUND),
    INVALID_QUOTATION_STATUS("5012", "Invalid quotation status", HttpStatus.BAD_REQUEST),
    QUOTATION_NOT_CALCULATED("5013", "Quotation must be calculated before sending", HttpStatus.BAD_REQUEST),
    SALES_ORDER_ALREADY_EXISTS("5014", "Sales order already exists for this quotation", HttpStatus.CONFLICT),

    // ===== 6xxx - Business logic errors =====
    PAYMENT_FAILED("6001", "Payment failed", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_BALANCE("6002", "Insufficient balance", HttpStatus.BAD_REQUEST),
    PRODUCT_OUT_OF_STOCK("6004", "Product out of stock", HttpStatus.CONFLICT),
    ORDER_NOT_FOUND("6005", "Order not found", HttpStatus.NOT_FOUND),
    INVALID_ORDER_TYPE("6006", "Invalid order type", HttpStatus.BAD_REQUEST),
    SALES_ORDER_NOT_FOUND("6007", "Sales order not found", HttpStatus.NOT_FOUND),
    INVALID_DATA("6008", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_STATE("6009", "Trạng thái nghiệp vụ không hợp lệ", HttpStatus.BAD_REQUEST),
    PROMOTION_NOT_APPLICABLE("6010", "Promotion is not applicable", HttpStatus.BAD_REQUEST),
    QUOTATION_EXPIRED("6011", "Quotation has expired", HttpStatus.BAD_REQUEST),

    // ===== 6xxx-2 - OrderItem, OrderTracking, SalesContract =====
    ORDER_ITEM_NOT_FOUND("6020", "Order item not found", HttpStatus.NOT_FOUND),
    ORDER_ITEM_ALREADY_EXISTS("6021", "Order item already exists for this variant", HttpStatus.CONFLICT),
    ORDER_ITEMS_REQUIRED("6022", "Order items are required", HttpStatus.BAD_REQUEST),
    INVALID_QUANTITY("6024", "Invalid quantity", HttpStatus.BAD_REQUEST),
    INVALID_UNIT_PRICE("6025", "Invalid unit price", HttpStatus.BAD_REQUEST),
    ORDER_TRACKING_NOT_FOUND("6030", "Order tracking record not found", HttpStatus.NOT_FOUND),
    SALES_CONTRACT_NOT_FOUND("6040", "Sales contract not found", HttpStatus.NOT_FOUND),
    SALES_CONTRACT_ALREADY_EXISTS("6041", "Sales contract already exists for this order", HttpStatus.CONFLICT),
    INVALID_CONTRACT_STATUS("6042", "Invalid contract status for this operation", HttpStatus.BAD_REQUEST),
    INVALID_CONTRACT_TERMS("6043", "Invalid contract terms", HttpStatus.BAD_REQUEST),
    MISSING_DIGITAL_SIGNATURE("6044", "Digital signature is required for signed contracts", HttpStatus.BAD_REQUEST),

    // ===== 6xxx-3 - SalesOrder B2C (Bán lẻ) =====
    /** Trạng thái đơn hàng không hợp lệ cho thao tác này */
    INVALID_ORDER_STATUS("6050", "Trạng thái đơn hàng không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST),

    /** Danh sách order items không được để trống */
    ORDER_ITEMS_REQUIRED_B2C("6051", "Danh sách order items không được để trống", HttpStatus.BAD_REQUEST),

    /** Variant ID là bắt buộc */
    VARIANT_ID_REQUIRED_B2C("6052", "Variant ID là bắt buộc", HttpStatus.BAD_REQUEST),

    /** Số lượng phải lớn hơn 0 */
    INVALID_QUANTITY_B2C("6053", "Số lượng phải lớn hơn 0", HttpStatus.BAD_REQUEST),

    /** Đơn giá phải lớn hơn 0 */
    INVALID_UNIT_PRICE_B2C("6054", "Đơn giá phải lớn hơn 0", HttpStatus.BAD_REQUEST),

    // ===== 7xxx - Vehicle service errors =====
    VEHICLE_MODEL_NOT_FOUND("7001", "Vehicle model not found", HttpStatus.NOT_FOUND),
    VEHICLE_MODEL_ALREADY_EXISTS("7002", "A vehicle model with this name and version already exists", HttpStatus.CONFLICT),
    VEHICLE_VARIANT_NOT_FOUND("7003", "Vehicle variant not found", HttpStatus.NOT_FOUND),
    FEATURE_NOT_FOUND("7004", "Feature not found", HttpStatus.NOT_FOUND),
    VEHICLE_VARIANT_SKU_ALREADY_EXISTS("7005", "A vehicle variant with this SKU code already exists", HttpStatus.CONFLICT),
    VARIANT_FEATURE_NOT_FOUND("7006", "A feature for variant not found", HttpStatus.NOT_FOUND),

    // ===== 8xxx - Inventory service errors =====
    INVENTORY_NOT_FOUND("8001", "Inventory record not found for this variant", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK("8002", "Not enough stock to perform the transaction", HttpStatus.BAD_REQUEST),
    ALLOCATION_NOT_FOUND("8003", "Allocation not found for this dealer and variant", HttpStatus.NOT_FOUND),

    // ===== 9xxx - External services =====
    EMAIL_SENDING_FAILED("9001", "Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR),
    CUSTOMER_NOT_FOUND("9002", "Customer not found", HttpStatus.NOT_FOUND),
    CUSTOMER_SERVICE_UNAVAILABLE("9003", "Customer service is unavailable", HttpStatus.SERVICE_UNAVAILABLE);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}

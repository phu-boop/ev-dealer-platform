package com.ev.customer_service.util;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Utility class để validate UUID
 */
public class UUIDValidator {
    
    // UUID format: 8-4-4-4-12 hexadecimal characters
    private static final Pattern UUID_PATTERN = Pattern.compile(
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    );
    
    /**
     * Kiểm tra xem string có phải là UUID hợp lệ không
     */
    public static boolean isValidUUID(String uuid) {
        if (uuid == null || uuid.trim().isEmpty()) {
            return false;
        }
        
        // Remove whitespace
        uuid = uuid.trim();
        
        // Check pattern
        if (!UUID_PATTERN.matcher(uuid).matches()) {
            return false;
        }
        
        // Try parse
        try {
            UUID.fromString(uuid);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Validate và throw exception nếu không hợp lệ
     */
    public static void validateUUID(String uuid, String fieldName) {
        if (!isValidUUID(uuid)) {
            throw new IllegalArgumentException(
                String.format("Invalid UUID format for %s: '%s'. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 
                    fieldName, uuid)
            );
        }
    }
}

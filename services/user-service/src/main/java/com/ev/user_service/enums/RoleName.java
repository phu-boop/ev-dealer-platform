package com.ev.user_service.enums;

import lombok.Getter;

@Getter
public enum RoleName {
    DEALER_STAFF("DEALER_STAFF"),
    DEALER_MANAGER("DEALER_MANAGER"),
    EVM_STAFF("EVM_STAFF"),
    ADMIN("ADMIN");

     private final String name;

    RoleName(String name) {
        this.name = name;
    }
     public String getRoleName() {
        return name;
    }
}


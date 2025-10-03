package com.ev.user_service.enums;

import lombok.Getter;

@Getter
public enum PermissionName {
    READ("READ"),
    WRITE("WRITE"),
    UPDATE("UPDATE"),
    DELETE("DELETE"),
    ADMIN("ADMIN");

    private final String permissionName;


    PermissionName(String permissionName) {
        this.permissionName = permissionName;
    }

}

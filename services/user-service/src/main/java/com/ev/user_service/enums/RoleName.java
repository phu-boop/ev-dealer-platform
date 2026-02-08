package com.ev.user_service.enums;

import lombok.Getter;

@Getter
public enum RoleName {
    DEALER_STAFF("DEALER_STAFF"),
    DEALER_MANAGER("DEALER_MANAGER"),
    EVM_STAFF("EVM_STAFF"),
<<<<<<< HEAD
    ADMIN("ADMIN"),
    CUSTOMER("CUSTOMER");

    private final String name;
=======
    ADMIN("ADMIN");

     private final String name;
>>>>>>> newrepo/main

    RoleName(String name) {
        this.name = name;
    }
<<<<<<< HEAD

    public String getRoleName() {
        return name;
    }
}
=======
     public String getRoleName() {
        return name;
    }
}

>>>>>>> newrepo/main

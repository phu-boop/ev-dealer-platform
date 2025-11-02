package com.ev.user_service.dto.request;

import com.ev.user_service.validation.group.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import com.ev.user_service.enums.Gender;
import com.ev.user_service.validation.annotation.MinAge;
import com.ev.user_service.validation.annotation.PasswordConstraint;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserRequest {

    // ----- COMMON -----
    @NotBlank(groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @Email(groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String email;

    @NotBlank(groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @PasswordConstraint(
        minLength = 8, hasUppercase = true, hasLowercase = true,
        hasNumber = true, hasSpecialChar = true,
        message = "PASSWORD_INVALID_FORMAT"
    )
    private String password;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String name;

    private String fullName;
    private String address;
    private String url;

    @Pattern(regexp = "^[0-9]{10,12}$", message = "PHONE_INVALID_FORMAT")
    private String phone;

    @MinAge(value = 18, message = "AGE_TOO_YOUNG")
    private LocalDate birthday;

    private String city;
    private String country;
    private Gender gender;
    // ---DEALER MANAGER && DEALER STAFF---

    @NotNull(groups = {OnCreateDealerStaff.class, OnCreateDealerManager.class})
    private UUID dealerId;

    // --- All ---

    @NotBlank(groups = {OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String department;

    // ----- DEALER MANAGER -----

    @NotBlank(groups = {OnCreateDealerManager.class})
    private String managementLevel;

    @NotNull(groups = {OnCreateDealerManager.class})
    private BigDecimal approvalLimit;

    // ----- DEALER STAFF -----

    @NotBlank(groups = {OnCreateDealerStaff.class})
    private String position;

    @NotNull(groups = {OnCreateDealerStaff.class})
    private LocalDate hireDate;

    @NotNull(groups = {OnCreateDealerStaff.class})
    private BigDecimal salary;

    @NotNull(groups = {OnCreateDealerStaff.class})
    private BigDecimal commissionRate;

    // ----- EVM STAFF -----

    @NotBlank(groups = {OnCreateEvmStaff.class})
    private String specialization;
}

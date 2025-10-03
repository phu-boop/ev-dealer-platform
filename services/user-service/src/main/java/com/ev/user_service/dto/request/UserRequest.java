package com.ev.user_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import com.ev.user_service.enums.Gender;
import com.ev.user_service.validation.annotation.MinAge;
import com.ev.user_service.validation.annotation.PasswordConstraint;
import com.ev.user_service.validation.group.OnCreate;
import com.ev.user_service.validation.group.OnUpdate;


import java.time.LocalDate;

@Data
public class UserRequest {
    @NotBlank(message = "MISSING_REQUIRED_FIELD", groups = {OnCreate.class, OnUpdate.class})
    @Email(message = "INVALID_EMAIL_FORMAT", groups = {OnCreate.class})
    String email;
    @NotBlank(message = "MISSING_REQUIRED_FIELD", groups = {OnCreate.class})
    @PasswordConstraint(
            minLength = 8,
            hasUppercase = true,
            hasLowercase = true,
            hasNumber = true,
            hasSpecialChar = true,
            message = "PASSWORD_INVALID_FORMAT",
            groups = {OnCreate.class}
    )
    String password;
    @NotBlank(message = "MISSING_REQUIRED_FIELD", groups = {OnCreate.class, OnUpdate.class})
    String name;
    String fullName;
    @NotNull(message = "PHONE_INVALID_FORMAT", groups = {OnCreate.class, OnUpdate.class})
    @Pattern(
            regexp = "^[0-9]{10,12}$",
            message = "PHONE_INVALID_FORMAT",
            groups = {OnCreate.class, OnUpdate.class}
    )
    String phone;
    String address;
    @MinAge(value = 18, message = "AGE_TOO_YOUNG", groups = {OnCreate.class, OnUpdate.class})
    LocalDate birthday;
    String city;
    String country;
    Gender gender;
}

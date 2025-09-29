package com.freelancehub.user_service.dto.respond;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.freelancehub.user_service.entity.Role;
import com.freelancehub.user_service.enums.Gender;

import java.time.LocalDate;
import java.util.Set;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRespond {
    Long id;
    String email;
    String name;
    String fullName;
    String phone;
    String address;
    String city;
    String country;
    LocalDate birthday;
    Gender gender;
    Set<Role> roles;
}

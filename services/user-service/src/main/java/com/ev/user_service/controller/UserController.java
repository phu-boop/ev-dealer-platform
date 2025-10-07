package com.ev.user_service.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.ev.user_service.dto.request.UserRequest;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.service.UserService;
import com.ev.user_service.validation.group.OnCreate;
import com.ev.user_service.validation.group.OnUpdate;

import java.util.List;

@RestController
@RequestMapping("/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    private final UserService userService;

    UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiRespond<List<UserRespond>>> getAllUser() {
        return ResponseEntity.ok(
                ApiRespond.success("Get All User Successfully", userService.getAllUser())
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiRespond<UserRespond>> getUserById(@PathVariable long id) {
        return ResponseEntity.ok(ApiRespond.success("Get User Successfully", userService.getUserById(id)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiRespond<UserRespond>> createUser(@Validated(OnCreate.class) @RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Create User Successfully", userService.createUser(userRequest)));
    }

    @PostMapping("/register/dealerStaff")
    public ResponseEntity<ApiRespond<UserRespond>> createUserDealerStaff(@Validated(OnCreate.class) @RequestBody UserRequest userRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Create User Successfully", userService.createUserDealerStaff(userRequest)));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiRespond<UserRespond>> updateUser(
            @PathVariable Long id,
            @Validated(OnUpdate.class) @Valid @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(
                ApiRespond.success("Update User Successfully", userService.updateUser(id, userRequest))
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRespond<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiRespond.success("Delete User Successfully", null));
    }
}
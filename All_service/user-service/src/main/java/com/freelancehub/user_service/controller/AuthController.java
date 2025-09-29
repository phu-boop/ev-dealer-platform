package com.freelancehub.user_service.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.freelancehub.user_service.dto.request.ChangePasswordRequest;
import com.freelancehub.common_lib.dto.respond.ApiRespond;
import com.freelancehub.user_service.dto.respond.LoginRespond;
import com.freelancehub.user_service.dto.respond.TokenPair;
import com.freelancehub.common_lib.exception.AppException;
import com.freelancehub.common_lib.exception.ErrorCode;
import com.freelancehub.user_service.service.AuthService;
import com.freelancehub.user_service.service.LoginAttemptService;
import com.freelancehub.user_service.service.RecaptchaService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final RecaptchaService recaptchaService;
    private final LoginAttemptService loginAttemptService;

    public AuthController(AuthService authService, RecaptchaService recaptchaService, LoginAttemptService loginAttemptService) {
        this.loginAttemptService = loginAttemptService;
        this.recaptchaService = recaptchaService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiRespond<LoginRespond>> login(@RequestBody Map<String, String> credentials, HttpServletResponse response) {
        //Spam
        if (loginAttemptService.isBlocked(credentials.get("email"))) {
            throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
        }
        //captcha
        boolean ok = recaptchaService.verifyCaptcha(credentials.get("captchaToken"));
        if (!ok) throw new AppException(ErrorCode.RECAPTCHA_FAILED);
        LoginRespond loginRespond = authService.login(
                credentials.get("email"),
                credentials.get("password")
        );
        // Gửi refresh token qua HttpOnly cookie
        var cookie = new Cookie("refreshToken", authService.generateRefreshToken(loginRespond.getUserRespond().getEmail()));
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60); // 30 ngày
        response.addCookie(cookie);
        return ResponseEntity.ok(ApiRespond.success("Login successful", loginRespond));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/me")
    public ResponseEntity<ApiRespond<LoginRespond>> getCurrentUser() {
        LoginRespond loginRespond = authService.getCurrentUser();
        return ResponseEntity.ok(ApiRespond.success("Get current user successful", loginRespond));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiRespond<?>> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        TokenPair tokenPair = authService.newRefreshTokenAndAccessToken(request);
        // Cập nhật lại cookie với refresh token mới
        Cookie cookie = new Cookie("refreshToken", tokenPair.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60); // 30 ngày
        response.addCookie(cookie);
        return ResponseEntity.ok(
                ApiRespond.success("RefreshToken successful", tokenPair));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiRespond<?>> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.addTokenBlacklist(request);
        // Xoá refresh token cookie
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(ApiRespond.success("Logout successful", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiRespond<?>> forgotPassword(@RequestParam String email) {
        authService.sendOtp(email);
        return ResponseEntity.ok(ApiRespond.success("OTP sent to your email", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiRespond<?>> resetPassword(@RequestParam String email,
                                                       @RequestParam String otp,
                                                       @RequestParam String newPassword) {
        boolean updated = authService.resetPassword(email, otp, newPassword);
        if (!updated) {
            return ResponseEntity.badRequest().body(new ApiRespond<>("6000", "otp code is incorrect", null));
        }
        return ResponseEntity.ok(ApiRespond.success("Password updated successfully", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @PostMapping("/change-password")
    public ResponseEntity<ApiRespond<?>> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        authService.changePassword(changePasswordRequest.getEmail(), changePasswordRequest.getOldPassword(), changePasswordRequest.getNewPassword());
        return ResponseEntity.ok(ApiRespond.success("Change password successfull", null));
    }
}
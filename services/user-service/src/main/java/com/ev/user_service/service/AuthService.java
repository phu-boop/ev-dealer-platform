package com.ev.user_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ev.user_service.dto.respond.LoginRespond;
import com.ev.user_service.dto.respond.TokenPair;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.entity.User;
import com.ev.user_service.mapper.UserMapper;
import com.ev.user_service.repository.UserRepository;
import com.ev.user_service.security.JwtUtil;
import java.util.UUID;

import java.security.SecureRandom;


@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final RedisService redisService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       UserMapper userMapper,
                       RedisService redisService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.redisService = redisService;
        this.emailService = emailService;
    }


    public LoginRespond login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        UUID memberId;
        switch (user.getRoleToString()) {
            case "DEALER_MANAGER" -> memberId = user.getDealerManagerProfile() != null 
                ? user.getDealerManagerProfile().getManagerId() : null;
            case "DEALER_STAFF" -> memberId = user.getDealerStaffProfile() != null 
                ? user.getDealerStaffProfile().getStaffId() : null;
            case "EVM_STAFF" -> memberId = user.getEvmStaffProfile() != null 
                ? user.getEvmStaffProfile().getEvmStaffId() : null;
            case "ADMIN" -> memberId = user.getAdminProfile() != null 
                ? user.getAdminProfile().getAdmin_id() : null;
            default -> memberId = null;
        }
        if (passwordEncoder.matches(password, user.getPassword())) {
            String token = jwtUtil.generateAccessToken(user.getEmail(), user.getRoleToString());
            UserRespond userRespond = userMapper.usertoUserRespond(user);
            userRespond.setMemberId(memberId);
            return new LoginRespond(userRespond, token);
        } else {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }
    }

    public LoginRespond getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserRespond userRespond = userMapper.usertoUserRespond(user);


        return new LoginRespond(userRespond, null);
    }

    public String generateRefreshToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return jwtUtil.generateRefreshToken(user.getEmail(), user.getRoleToString());
    }

    public TokenPair newRefreshTokenAndAccessToken(HttpServletRequest request) {
        // Lấy refresh token từ cookie
        String refreshToken = getRefreshTokenFromRequest(request);
        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        if (redisService.contains(refreshToken)) {
            throw new AppException(ErrorCode.TOKEN_LOGGED_OUT);
        }
        String newAccessToken = jwtUtil.generateAccessToken(
                jwtUtil.extractEmail(refreshToken),
                jwtUtil.extractRole(refreshToken)
        );
        String newRefreshToken = jwtUtil.generateRefreshToken(
                jwtUtil.extractEmail(refreshToken),
                jwtUtil.extractRole(refreshToken)
        );
        return new TokenPair(newAccessToken, newRefreshToken);
    }

    public void addTokenBlacklist(HttpServletRequest request) {
        String token = parseJwt(request);
        String tokenRefresh = getRefreshTokenFromRequest(request);
        System.out.println(tokenRefresh);
        System.out.println(token);
        if (token == null || tokenRefresh == null) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (!jwtUtil.validateToken(token) || !jwtUtil.validateToken(tokenRefresh)) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        long expirationSeconds_refresh = jwtUtil.getRemainingSeconds(tokenRefresh);
        long expirationSeconds_access = jwtUtil.getRemainingSeconds(token);
        redisService.addToken(tokenRefresh, expirationSeconds_refresh);
        redisService.addToken(token, expirationSeconds_access);

    }


    public boolean sendOtp(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String otp = generateOtp(6);
        redisService.saveOtp(email, otp, 5);
        emailService.sendOtpEmail(email, otp);
        return true;
    }

    public boolean resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        boolean validOtp = redisService.validateOtp(email, otp);
        if (!validOtp) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        redisService.removeOtp(email);
        return true;
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    private String getRefreshTokenFromRequest(HttpServletRequest request) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refreshToken".equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }
        return refreshToken;
    }

    private static final String DIGITS = "0123456789";
    private static final SecureRandom random = new SecureRandom();

    public static String generateOtp(int length) {
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(DIGITS.length());
            otp.append(DIGITS.charAt(index));
        }
        return otp.toString();
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

}

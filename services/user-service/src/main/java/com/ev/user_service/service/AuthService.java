package com.ev.user_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.dto.respond.ProfileRespond;
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

import com.ev.user_service.repository.DealerManagerProfileRepository;
import com.ev.user_service.repository.DealerStaffProfileRepository;
import com.ev.user_service.entity.DealerManagerProfile;
import com.ev.user_service.entity.DealerStaffProfile;
import java.util.Optional;

import java.time.LocalDateTime;
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

    private final DealerManagerProfileRepository managerProfileRepository;
    private final DealerStaffProfileRepository staffProfileRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       UserMapper userMapper,
                       RedisService redisService,
                       EmailService emailService,
                       DealerManagerProfileRepository managerProfileRepository,
                       DealerStaffProfileRepository staffProfileRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.redisService = redisService;
        this.emailService = emailService;

        this.managerProfileRepository = managerProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
    }


    public LoginRespond login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (passwordEncoder.matches(password, user.getPassword())) {
            // === 4. LOGIC MỚI ĐỂ LẤY DEALER ID ===

            // Lấy thông tin cơ bản
            String role = user.getRoleToString();
            UUID profileId = user.getProfileId(); // Đây là staffId hoặc managerId
            UUID userId = user.getId();
            UUID dealerId = null; // Biến để lưu dealerId

            // Truy vấn profile tương ứng để lấy dealerId
            if ("DEALER_MANAGER".equals(role)) {
                // Sửa: Tìm bằng userId, không phải profileId
                Optional<DealerManagerProfile> profile = managerProfileRepository.findByUserId(userId);
                if (profile.isPresent()) {
                    dealerId = profile.get().getDealerId();
                }
            } else if ("DEALER_STAFF".equals(role)) {
                // Sửa: Tìm bằng userId, không phải profileId
                Optional<DealerStaffProfile> profile = staffProfileRepository.findByUserId(userId);
                if (profile.isPresent()) {
                    dealerId = profile.get().getDealerId();
                }
            }
            // === KẾT THÚC LOGIC MỚI ===
            String token = jwtUtil.generateAccessToken(user.getEmail(), user.getRoleToString(), user.getProfileId().toString());
            UserRespond userRespond = userMapper.usertoUserRespond(user);
            userRespond.setMemberId(user.getProfileId());
            userRespond.setUrl(user.getUrl());

            // === 5. GÁN DEALER ID VÀO RESPONSE ===
            userRespond.setDealerId(dealerId);

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
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
        return jwtUtil.generateRefreshToken(user.getEmail(), user.getRoleToString(), user.getProfileId().toString());
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
                jwtUtil.extractRole(refreshToken),
                jwtUtil.extractProfileId(refreshToken)
        );
        String newRefreshToken = jwtUtil.generateRefreshToken(
                jwtUtil.extractEmail(refreshToken),
                jwtUtil.extractRole(refreshToken),
                jwtUtil.extractProfileId(refreshToken)
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

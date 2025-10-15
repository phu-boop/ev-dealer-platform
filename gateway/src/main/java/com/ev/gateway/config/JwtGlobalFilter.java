package com.ev.gateway.config;

import com.ev.common_lib.exception.ErrorCode;
import com.ev.gateway.util.JwtUtil;
import com.ev.gateway.service.RedisService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtGlobalFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;
    private final RedisService redisService;

    //  Danh sách path được bỏ qua xác thực
    private static final List<String> EXCLUDED_PATHS = List.of(
            "/auth/",
            "/users/"
    );

    public JwtGlobalFilter(JwtUtil jwtUtil, RedisService redisService) {
        this.jwtUtil = jwtUtil;
        this.redisService = redisService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        
        System.out.println("=== JwtGlobalFilter ===");
        System.out.println("Path: " + path);

        // Ngoại lệ
        if (EXCLUDED_PATHS.stream().anyMatch(path::startsWith)) {
            System.out.println("Path excluded - skipping JWT validation");
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        System.out.println("Authorization Header: " + (authHeader != null ? authHeader.substring(0, Math.min(50, authHeader.length())) + "..." : "null"));
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("ERROR: No Bearer token found");
            return this.onError(exchange, ErrorCode.UNAUTHORIZED.getCode(), ErrorCode.UNAUTHORIZED.getMessage(), HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            // Kiểm tra Redis blacklist - nếu Redis down thì bỏ qua
            try {
                if (redisService.contains(token)) {
                    System.out.println("ERROR: Token is logged out");
                    return this.onError(exchange, ErrorCode.TOKEN_LOGGED_OUT.getCode(), ErrorCode.TOKEN_LOGGED_OUT.getMessage(), ErrorCode.TOKEN_LOGGED_OUT.getHttpStatus());
                }
            } catch (Exception redisEx) {
                System.out.println("⚠️ WARNING: Redis connection failed - skipping blacklist check");
                System.out.println("Redis error: " + redisEx.getMessage());
                // Tiếp tục xác thực JWT mà không kiểm tra blacklist
            }

            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            Long userId = jwtUtil.extractUserId(token);
            
            System.out.println("JWT Claims - Email: " + email + ", Role: " + role + ", UserId: " + userId);

            if (!jwtUtil.isTokenValid(token, email)) {
                System.out.println("ERROR: Token is not valid");
                return this.onError(exchange, ErrorCode.TOKEN_INVALID.getCode(), ErrorCode.TOKEN_INVALID.getMessage(), ErrorCode.TOKEN_INVALID.getHttpStatus());
            }

            System.out.println("✅ JWT validation successful - forwarding request");
            
            // Tạo Authentication object cho Spring Security
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
            );
            
            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r.headers(headers -> {
                        headers.add("X-User-Email", email);
                        headers.add("X-User-Role", role);
                        headers.add("X-User-Id", String.valueOf(userId));
                    }))
                    .build();

            // Set authentication context và forward request
            return chain.filter(mutatedExchange)
                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));

        } catch (ExpiredJwtException e) {
            System.out.println("ERROR: Token expired - " + e.getMessage());
            return this.onError(exchange, ErrorCode.TOKEN_EXPIRED.getCode(), ErrorCode.TOKEN_EXPIRED.getMessage(), ErrorCode.TOKEN_EXPIRED.getHttpStatus());
        } catch (JwtException e) {
            System.out.println("ERROR: JWT exception - " + e.getMessage());
            return this.onError(exchange, ErrorCode.TOKEN_INVALID.getCode(), ErrorCode.TOKEN_INVALID.getMessage(), ErrorCode.TOKEN_INVALID.getHttpStatus());
        } catch (Exception e) {
            System.out.println("ERROR: Unexpected exception - " + e.getMessage());
            e.printStackTrace();
            return this.onError(exchange, ErrorCode.TOKEN_INVALID.getCode(), "Token processing failed", ErrorCode.TOKEN_INVALID.getHttpStatus());
        }
    }


    @Override
    public int getOrder() {
        return -1; // chạy sớm nhất
    }
    private Mono<Void> onError(ServerWebExchange exchange, String code, String message, HttpStatus httpStatus) {
        var response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("Content-Type", "application/json; charset=UTF-8");

        String body = String.format("{\"code\":\"%s\",\"message\":\"%s\",\"data\":null}", code, message);
        byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

}

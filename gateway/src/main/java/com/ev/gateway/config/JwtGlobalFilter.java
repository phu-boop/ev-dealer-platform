package com.ev.gateway.config;

import com.ev.common_lib.exception.ErrorCode;
import com.ev.gateway.util.JwtUtil;
import com.ev.gateway.service.RedisService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.io.IOException;
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

        // Ngoại lệ
        if (EXCLUDED_PATHS.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return this.onError(exchange, ErrorCode.UNAUTHORIZED.getCode(), ErrorCode.UNAUTHORIZED.getMessage(), HttpStatus.UNAUTHORIZED);

        }

        String token = authHeader.substring(7);

        try {
            if (redisService.contains(token)) {
            return this.onError(exchange, ErrorCode.TOKEN_LOGGED_OUT.getCode(), ErrorCode.TOKEN_LOGGED_OUT.getMessage(), ErrorCode.TOKEN_LOGGED_OUT.getHttpStatus());
            }

            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            Long userId = jwtUtil.extractUserId(token);
            String profileId = jwtUtil.extractProfileId(token);

            if (!jwtUtil.isTokenValid(token, email)) {
            return this.onError(exchange, ErrorCode.TOKEN_INVALID.getCode(), ErrorCode.TOKEN_INVALID.getMessage(), ErrorCode.TOKEN_INVALID.getHttpStatus());
            }

            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r.headers(headers -> {
                        headers.add("X-User-Email", email);
                        headers.add("X-User-Role", role);
                        headers.add("X-User-Id", String.valueOf(userId));
                        headers.add("X-User-ProfileId", profileId);
                    }))
                    .build();

            return chain.filter(mutatedExchange);

        } catch (ExpiredJwtException e) {
            return this.onError(exchange, ErrorCode.TOKEN_EXPIRED.getCode(), ErrorCode.TOKEN_EXPIRED.getMessage(), ErrorCode.TOKEN_EXPIRED.getHttpStatus());
        } catch (JwtException e) {
            return this.onError(exchange, ErrorCode.TOKEN_INVALID.getCode(), ErrorCode.TOKEN_INVALID.getMessage(), ErrorCode.TOKEN_INVALID.getHttpStatus());
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

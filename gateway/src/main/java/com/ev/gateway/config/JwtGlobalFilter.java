package com.ev.gateway.config;

<<<<<<< HEAD
=======
import com.ev.common_lib.exception.ErrorCode;
>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
import com.ev.gateway.util.JwtUtil;
import com.ev.gateway.service.RedisService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
<<<<<<< HEAD
=======
import jakarta.servlet.http.HttpServletResponse;
>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

<<<<<<< HEAD
=======
import java.io.IOException;
>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
import java.util.List;

@Component
public class JwtGlobalFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;
    private final RedisService redisService;

<<<<<<< HEAD
    // 🧩 Danh sách path được bỏ qua xác thực
    private static final List<String> EXCLUDED_PATHS = List.of(
            "/auth/",       // đăng nhập, đăng ký
            "/users/"       // public user endpoints
=======
    //  Danh sách path được bỏ qua xác thực
    private static final List<String> EXCLUDED_PATHS = List.of(
            "/auth/",
            "/users/"
>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
    );

    public JwtGlobalFilter(JwtUtil jwtUtil, RedisService redisService) {
        this.jwtUtil = jwtUtil;
        this.redisService = redisService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

<<<<<<< HEAD
        // ⚡ 1️⃣ Bỏ qua các URL nằm trong danh sách EXCLUDED_PATHS
=======
        // Ngoại lệ
>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
        if (EXCLUDED_PATHS.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

<<<<<<< HEAD
        // ⚡ 2️⃣ Lấy token
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return this.onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
=======
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return this.onError(exchange, ErrorCode.UNAUTHORIZED.getCode(), ErrorCode.UNAUTHORIZED.getMessage(), HttpStatus.UNAUTHORIZED);

>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
        }

        String token = authHeader.substring(7);

        try {
<<<<<<< HEAD
            // ⚡ 3️⃣ Kiểm tra token có bị logout trong Redis không
            if (redisService.contains(token)) {
                return this.onError(exchange, "Token has been logged out", HttpStatus.UNAUTHORIZED);
            }

            // ⚡ 4️⃣ Giải mã token
=======
            if (redisService.contains(token)) {
            return this.onError(exchange, ErrorCode.TOKEN_LOGGED_OUT.getCode(), ErrorCode.TOKEN_LOGGED_OUT.getMessage(), ErrorCode.TOKEN_LOGGED_OUT.getHttpStatus());
            }

>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            Long userId = jwtUtil.extractUserId(token);

            if (!jwtUtil.isTokenValid(token, email)) {
<<<<<<< HEAD
                return this.onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
            }

            // ⚡ 5️⃣ Thêm thông tin người dùng vào header để gửi xuống service
=======
            return this.onError(exchange, ErrorCode.TOKEN_INVALID.getCode(), ErrorCode.TOKEN_INVALID.getMessage(), ErrorCode.TOKEN_INVALID.getHttpStatus());
            }

>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r.headers(headers -> {
                        headers.add("X-User-Email", email);
                        headers.add("X-User-Role", role);
                        headers.add("X-User-Id", String.valueOf(userId));
                    }))
                    .build();

            return chain.filter(mutatedExchange);

        } catch (ExpiredJwtException e) {
<<<<<<< HEAD
            return this.onError(exchange, "Token expired", HttpStatus.UNAUTHORIZED);
        } catch (JwtException e) {
            return this.onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }
=======
            return this.onError(exchange, ErrorCode.TOKEN_EXPIRED.getCode(), ErrorCode.TOKEN_EXPIRED.getMessage(), ErrorCode.TOKEN_EXPIRED.getHttpStatus());
        } catch (JwtException e) {
            return this.onError(exchange, ErrorCode.TOKEN_INVALID.getCode(), ErrorCode.TOKEN_INVALID.getMessage(), ErrorCode.TOKEN_INVALID.getHttpStatus());
        }
    }

>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9

    @Override
    public int getOrder() {
        return -1; // chạy sớm nhất
    }
<<<<<<< HEAD
=======
    private Mono<Void> onError(ServerWebExchange exchange, String code, String message, HttpStatus httpStatus) {
        var response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("Content-Type", "application/json; charset=UTF-8");

        String body = String.format("{\"code\":\"%s\",\"message\":\"%s\",\"data\":null}", code, message);
        byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

>>>>>>> a38fe336d6a5fd2139ce2949280eb626999a20a9
}

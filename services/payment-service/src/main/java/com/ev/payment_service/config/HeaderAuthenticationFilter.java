package com.ev.payment_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Đọc các header X-User-* (do Gateway thêm vào)
 * và tạo một Authentication object chuẩn cho Spring Security.
 */
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Đọc các header tin cậy từ Gateway
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role"); // Ví dụ: "ADMIN" hoặc "EVM_STAFF"

        // 2. Nếu không có header (request public), cứ cho qua
        if (email == null || role == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Tạo GrantedAuthority (ROLE)
        // Spring sẽ tự động thêm tiền tố "ROLE_" khi check "hasRole()"
        // NHƯNG chúng ta sẽ thêm sẵn ROLE_ ở đây cho chắc chắn.
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        // 4. Tạo đối tượng Authentication chuẩn
        // Chúng ta dùng email làm "principal" (tên người dùng)
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                email,  // Principal (username)
                null,   // Credentials (password)
                authorities // Authorities (quyền)
        );

        // 5. Đặt đối tượng Authentication vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 6. Cho request đi tiếp
        filterChain.doFilter(request, response);
    }
}
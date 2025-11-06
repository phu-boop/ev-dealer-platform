package com.ev.payment_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Vẫn giữ để @PreAuthorize hoạt động
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // XÓA BỎ HOÀN TOÀN .oauth2ResourceServer()

                // THÊM FILTER MỚI CỦA CHÚNG TA VÀO TRƯỚC
                // Filter này sẽ đọc header và "xác thực" người dùng
                .addFilterBefore(new HeaderAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(authorize -> authorize
                        // API public vẫn là permitAll
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/methods/active-public").permitAll()

                        // Mọi request khác đều cần "xác thực" (đã được filter của chúng ta xử lý)
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // XÓA BỎ HOÀN TOÀN CÁC BEAN:
    // - jwtDecoder()
    // - jwtAuthenticationConverter()
    // Chúng không còn cần thiết nữa.
}
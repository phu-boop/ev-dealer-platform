package com.ev.vehicle_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@Profile("!dev") // <-- HOẠT ĐỘNG KHI PROFILE KHÔNG PHẢI LÀ "dev"
public class ProductionSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Đây là nơi cấu hình JWT thật sự sau này
        System.out.println(">>> Running in PRODUCTION security mode. JWT is required. <<<");

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Cho phép GET công khai
                .requestMatchers(HttpMethod.GET, "/vehicle-models/**").permitAll()
                // Yêu cầu quyền "EVM_STAFF" cho các thao tác thay đổi dữ liệu
                .requestMatchers(HttpMethod.POST, "/vehicle-models").hasAnyAuthority("EVM_STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/vehicle-models/**").hasAnyAuthority("EVM_STAFF", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/vehicle-models/**").hasAnyAuthority("EVM_STAFF", "ADMIN")
                // Tất cả các request còn lại phải được xác thực
                .anyRequest().authenticated() 
            );

        // TODO: Thêm bộ lọc JWT (JwtAuthenticationFilter) vào đây

        return http.build();
    }
}

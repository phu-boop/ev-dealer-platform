package com.ev.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Thêm cấu hình CORS
                .authorizeExchange(exchanges -> exchanges
                // ===== Cho phép public routes =====
                .pathMatchers(
                        "/", 
                        "/error", 
                        "/swagger-ui/**", 
                        "/v3/api-docs/**",
                        
                        // user-service
                        "/auth/**", 
                        "/users/**",
                        
                        // customer-service
                        "/customers/**",
                        
                        // dealer-service
                        "/dealers/**",
                        
                        // inventory-service
                        "/inventory/**",
                        
                        // payment-service
                        "/payments/**",

                        // === SỬA LẠI ĐƯỜNG DẪN CHO SALES-SERVICE ===
                        // Thêm tiền tố /sales/ vào trước
                        "/sales/promotions/**",
                        "/sales/quotations/**",
                        // "/sales/**" // Dòng này của bạn đã đúng, nhưng 2 dòng trên rõ ràng hơn
                        
                        // vehicle-service
                        "/vehicles/**"
                    ).permitAll()
                    
                    // ===== Các route khác cần JWT =====
                    .anyExchange().authenticated()
                )
                // Không tạo session
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.addAllowedOrigin("http://localhost:5173");
        corsConfig.addAllowedMethod("*"); // Cho phép tất cả phương thức: GET, POST, PUT, DELETE, OPTIONS
        corsConfig.addAllowedHeader("*"); // Cho phép tất cả header
        corsConfig.setAllowCredentials(true); // Cho phép gửi cookie/token
        corsConfig.setMaxAge(3600L); // Cache preflight request trong 1 giờ

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }
}
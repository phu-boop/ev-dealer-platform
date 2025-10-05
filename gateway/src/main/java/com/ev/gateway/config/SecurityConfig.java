package com.ev.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        // Cho phép public routes
                        .pathMatchers("/", "/error", "/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Cần JWT (đã xác thực qua JwtGlobalFilter)
                        .anyExchange().authenticated()
                )
                // Không tạo session
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .build();
    }
}

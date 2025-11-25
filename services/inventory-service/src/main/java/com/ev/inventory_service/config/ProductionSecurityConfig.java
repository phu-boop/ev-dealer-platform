package com.ev.inventory_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
@Profile("!dev") // Hoạt động khi profile KHÔNG PHẢI là "dev"
public class ProductionSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    public ProductionSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println(">>> Running in PRODUCTION security mode. JWT is required. <<<");

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/inventory/**").hasAnyRole("DEALER_STAFF", "DEALER_MANAGER", "EVM_STAFF")
                .requestMatchers(HttpMethod.POST, "/inventory/transactions").hasAnyRole("EVM_STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/inventory/dealer-stock/**").hasAnyRole("DEALER_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/inventory/central-stock/**").hasAnyRole("EVM_STAFF", "ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

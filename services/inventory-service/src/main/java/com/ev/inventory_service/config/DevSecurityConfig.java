package com.ev.inventory_service.config;

// import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.access.intercept.AuthorizationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Profile("dev") // <-- CHỈ HOẠT ĐỘNG KHI PROFILE LÀ "dev"
public class DevSecurityConfig {
    private final GatewayHeaderFilter gatewayHeaderFilter;

    public DevSecurityConfig(GatewayHeaderFilter gatewayHeaderFilter) {
        this.gatewayHeaderFilter = gatewayHeaderFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // In môi trường dev, cho phép tất cả request đi qua
        System.out.println("!!! ATTENTION: Running in DEV security mode. All requests are permitted. !!!");

        http
                .csrf(csrf -> csrf.disable())
                // .authorizeHttpRequests(auth -> auth
                //      .anyRequest().permitAll()
                // )
                .authorizeHttpRequests(auth -> auth

                
                .requestMatchers(HttpMethod.GET, "/inventory/**").hasAnyRole("EVM_STAFF", "ADMIN","DEALER_MANAGER","DEALER_STAFF")
                .requestMatchers(HttpMethod.GET, "/my-stock").hasAnyRole("DEALER_MANAGER", "DEALER_STAFF")
                .requestMatchers(HttpMethod.POST, "/inventory/transactions").hasAnyRole("EVM_STAFF", "ADMIN") 
                .requestMatchers(HttpMethod.PUT, "/inventory/dealer-stock/**").hasAnyRole("DEALER_MANAGER", "ADMIN") 
                .requestMatchers(HttpMethod.PUT, "/inventory/central-stock/**").hasAnyRole("EVM_STAFF", "ADMIN") 
                .anyRequest().authenticated()
                    .requestMatchers(HttpMethod.GET, "/inventory/**").hasAnyRole("DEALER_STAFF", "EVM_STAFF", "ADMIN") 
                    .requestMatchers(HttpMethod.GET, "/my-stock").hasAnyRole("DEALER_MANAGER", "DEALER_STAFF")
                    .requestMatchers(HttpMethod.POST, "/inventory/transactions").hasAnyRole("EVM_STAFF", "ADMIN") 
                    .requestMatchers(HttpMethod.PUT, "/inventory/dealer-stock/**").hasAnyRole("DEALER_MANAGER", "ADMIN") 
                    .requestMatchers(HttpMethod.PUT, "/inventory/central-stock/**").hasAnyRole("EVM_STAFF", "ADMIN") 
                    .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex.accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
                            response.setContentType("application/json");
                            String body = String.format("{\"code\":\"%s\",\"message\":\"%s\"}",
                                    ErrorCode.FORBIDDEN.getCode(),
                                    ErrorCode.FORBIDDEN.getMessage());
                            response.getWriter().write(body);
                        })
                )
                // Đặt filter của gateway chạy TRƯỚC AnonymousAuthenticationFilter để set Authentication đúng
                .addFilterBefore(gatewayHeaderFilter, org.springframework.security.web.authentication.AnonymousAuthenticationFilter.class);
        ;
        return http.build();
    }
}

package com.ev.inventory_service.config;

import com.ev.common_lib.exception.AppException;
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
                .authorizeHttpRequests(auth -> auth
                     .anyRequest().permitAll()
                )
                // .authorizeHttpRequests(auth -> auth

                //         // Đại lý, Nhân viên hãng, và Admin đều có thể xem tồn kho.
                //         .requestMatchers(HttpMethod.GET, "/inventory/**").hasAnyRole("DEALER_STAFF", "EVM_STAFF", "ADMIN")

                //         // Chỉ Nhân viên hãng và Admin mới được thực hiện các giao dịch kho (nhập, xuất, điều chuyển)
                //         .requestMatchers(HttpMethod.POST, "/inventory/transactions").hasAnyRole("EVM_STAFF", "ADMIN")

                //         // Chỉ Quản lý đại lí và (admin) mới có thể thực hiện chỉnh ngưỡng cảnh báo cho đại lí của họ
                //         .requestMatchers(HttpMethod.PUT, "/inventory/dealer-stock/**").hasAnyRole("DEALER_MANAGER", "ADMIN")

                //         // Chỉ Nhân viên hãng và (admin) mới có thể thực hiện chỉnh ngưỡng cảnh báo cho hãng của họ
                //         .requestMatchers(HttpMethod.PUT, "/inventory/central-stock/**").hasAnyRole("EVM_STAFF", "ADMIN")
                //         // Các request khác (nếu có) ít nhất phải được xác thực
                //         .anyRequest().authenticated()
                // )
                .exceptionHandling(ex -> ex.accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
                            response.setContentType("application/json");
                            String body = String.format("{\"code\":\"%s\",\"message\":\"%s\"}",
                                    ErrorCode.FORBIDDEN.getCode(),
                                    ErrorCode.FORBIDDEN.getMessage());
                            response.getWriter().write(body);
                        })
                )
                .addFilterBefore(gatewayHeaderFilter, UsernamePasswordAuthenticationFilter.class);
        ;
        return http.build();
    }
}

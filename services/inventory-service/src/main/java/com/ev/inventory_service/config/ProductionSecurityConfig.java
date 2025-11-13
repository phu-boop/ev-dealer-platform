package com.ev.inventory_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@Profile("!dev") // Hoạt động khi profile KHÔNG PHẢI là "dev"
public class ProductionSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println(">>> Running in PRODUCTION security mode. JWT is required. <<<");

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                
                // Đại lý, Nhân viên hãng, và Admin đều có thể xem tồn kho.
                .requestMatchers(HttpMethod.GET, "/inventory/**").hasAnyRole("DEALER_STAFF", "DEALER_MANAGER", "EVM_STAFF")

                // Chỉ Nhân viên hãng và Admin mới được thực hiện các giao dịch kho (nhập, xuất, điều chuyển)
                .requestMatchers(HttpMethod.POST, "/inventory/transactions").hasAnyRole("EVM_STAFF", "ADMIN")
                
                // Chỉ Quản lý đại lí và (admin) mới có thể thực hiện chỉnh ngưỡng cảnh báo cho đại lí của họ
                .requestMatchers(HttpMethod.PUT, "/inventory/dealer-stock/**").hasAnyRole("DEALER_MANAGER", "ADMIN")

                // Chỉ Nhân viên hãng và (admin) mới có thể thực hiện chỉnh ngưỡng cảnh báo cho hãng của họ
                .requestMatchers(HttpMethod.PUT, "/inventory/central-stock/**").hasAnyRole("EVM_STAFF", "ADMIN")
                // Các request khác (nếu có) ít nhất phải được xác thực
                .anyRequest().authenticated() 
            );

        // TODO: Thêm bộ lọc JWT (JwtAuthenticationFilter) vào đây để xác thực token

        return http.build();
    }
}

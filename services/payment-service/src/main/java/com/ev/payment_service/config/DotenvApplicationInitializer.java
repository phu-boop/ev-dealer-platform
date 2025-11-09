package com.ev.payment_service.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Tải các biến từ file .env vào Spring Environment TRƯỚC KHI
 * application.properties được xử lý.
 */
public class DotenvApplicationInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();

        // Tải file .env từ thư mục gốc của project
        Dotenv dotenv = Dotenv.configure()
                .directory("./") // Thư mục gốc
                .ignoreIfMissing() // Bỏ qua nếu không thấy file .env
                .load();

        // Lấy tất cả các biến
        Map<String, Object> envMap = dotenv.entries().stream()
                .collect(Collectors.toMap(
                        DotenvEntry::getKey,   // << SỬA Ở ĐÂY
                        DotenvEntry::getValue  // << SỬA Ở ĐÂY
                ));

        // Thêm chúng vào Spring Environment
        environment.getPropertySources().addFirst(
                new MapPropertySource("dotenvProperties", envMap)
        );
    }
}
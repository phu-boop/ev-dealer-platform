package com.ev.inventory_service.util;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

public class DotenvTestInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        // Đoạn code này gần như giống hệt trong hàm main
        Dotenv.configure()
              .ignoreIfMissing()
              .systemProperties()
              .load();
    }
}

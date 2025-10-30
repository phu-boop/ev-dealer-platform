package com.ev.dealer_service.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

public class DotenvApplicationInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Dotenv.configure()
              .ignoreIfMissing()
              .systemProperties()
              .load();
    }
}

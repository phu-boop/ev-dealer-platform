package com.ev.user_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(scanBasePackages = {
        "com.ev.user_service",
        "com.ev.common_lib"
})
public class UserServiceApplication {

	public static void main(String[] args) {
		Dotenv.configure()
              .ignoreIfMissing()
              .systemProperties()
              .load();
		SpringApplication.run(UserServiceApplication.class, args);
	}

}

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
		Dotenv dotenv = Dotenv.configure()
                              .directory("src/main/resources") //Đường dẫn tới thư mục chứa file .env
                              .ignoreIfMissing()
                              .load();
        
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
		SpringApplication.run(UserServiceApplication.class, args);
	}

}

package com.ev.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

<<<<<<< HEAD
=======
import io.github.cdimascio.dotenv.Dotenv;

>>>>>>> newrepo/main
@EnableDiscoveryClient
@SpringBootApplication(exclude = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
})
<<<<<<< HEAD
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
=======
public class    GatewayApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
                              .directory("src/main/resources") //Đường dẫn tới thư mục chứa file .env
                              .ignoreIfMissing()
                              .load();
        
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
		SpringApplication.run(GatewayApplication.class, args);
	}
>>>>>>> newrepo/main

}

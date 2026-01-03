package com.ev.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import io.github.cdimascio.dotenv.Dotenv;

@EnableDiscoveryClient
@SpringBootApplication(exclude = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
})
public class GatewayApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("src/main/resources") // Đường dẫn tới thư mục chứa file .env
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        // Convert service names to localhost for local development
        // This is needed when running locally (not in Docker)
        convertServiceUriToLocalhost("USER_SERVICE_URI", "8081");
        convertServiceUriToLocalhost("CUSTOMER_SERVICE_URI", "8082");
        convertServiceUriToLocalhost("DEALER_SERVICE_URI", "8083");
        convertServiceUriToLocalhost("INVENTORY_SERVICE_URI", "8084");
        convertServiceUriToLocalhost("PAYMENT_SERVICE_URI", "8085");
        convertServiceUriToLocalhost("SALES_SERVICE_URI", "8086");
        convertServiceUriToLocalhost("SALES_SERVICE_WS_URI", "8086", "ws");
        convertServiceUriToLocalhost("VEHICLE_SERVICE_URI", "8087");
        convertServiceUriToLocalhost("REPORTING_SERVICE_URI", "8088");
        convertServiceUriToLocalhost("AI_SERVICE_URI", "8500");

        // Set default CORS if not set
        if (System.getProperty("APP_CORS_ALLOWED_ORIGINS") == null) {
            System.setProperty("APP_CORS_ALLOWED_ORIGINS",
                    "http://localhost:5173,http://localhost:5174,https://sandbox.vnpayment.vn");
        }

        // Convert Redis host to localhost for local development
        String redisHost = System.getProperty("SPRING_REDIS_HOST");
        // Kiểm tra nếu là "redis" HOẶC "redis-db" thì đổi về localhost
        if (redisHost != null && !redisHost.equals("localhost")) {
            // Logic: Nếu đang chạy trên máy dev, ta muốn override thành localhost
            // (Giả sử bạn luôn muốn chạy local khi debug bằng IntelliJ)
            System.setProperty("SPRING_REDIS_HOST", "localhost");
            System.out.println("[Gateway] FORCE SWITCH: SPRING_REDIS_HOST converted to 'localhost' for local dev.");
        }

        SpringApplication.run(GatewayApplication.class, args);
    }

    /**
     * Convert service URI from Docker service name to localhost for local
     * development
     */
    private static void convertServiceUriToLocalhost(String propertyKey, String port) {
        convertServiceUriToLocalhost(propertyKey, port, "http");
    }

    private static void convertServiceUriToLocalhost(String propertyKey, String port, String protocol) {
        String uri = System.getProperty(propertyKey);
        if (uri != null && uri.contains("-service:") && !uri.contains("localhost")) {
            // Convert http://service-name:port to http://localhost:port
            String newUri = protocol + "://localhost:" + port;
            System.setProperty(propertyKey, newUri);
            System.out.println(
                    "[Gateway] Converted " + propertyKey + " from " + uri + " to " + newUri + " for local development");
        }
    }

}

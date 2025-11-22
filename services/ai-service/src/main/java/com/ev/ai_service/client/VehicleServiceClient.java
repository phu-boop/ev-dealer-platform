package com.ev.ai_service.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Client để gọi Vehicle Service API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${vehicle.service.url}")
    private String vehicleServiceUrl;

    /**
     * Lấy thông tin variant từ Vehicle Service
     * Fix: 401 Unauthorized, Encoding, Null validation
     */
    public VehicleVariantInfo getVariantInfo(Long variantId) {
        // Validation: Không gọi API nếu variantId không hợp lệ
        if (variantId == null || variantId <= 0) {
            log.warn("Invalid variant ID: {}", variantId);
            return null;
        }

        try {
            log.debug("Fetching variant info for ID: {}", variantId);

            return webClientBuilder
                    .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .defaultHeader(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.name())
                    // Note: Vehicle Service không require authentication trong môi trường internal
                    // Nếu cần auth, uncomment dòng dưới:
                    // .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " +
                    // getInternalServiceToken())
                    .build()
                    .get()
                    .uri(vehicleServiceUrl + "/api/vehicle-variants/" + variantId)
                    .acceptCharset(StandardCharsets.UTF_8)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            response -> {
                                if (response.statusCode().value() == 401) {
                                    log.error("401 Unauthorized when calling Vehicle Service for variant {}. " +
                                            "Check if authentication is required.", variantId);
                                } else if (response.statusCode().value() == 404) {
                                    log.warn("Variant {} not found in Vehicle Service", variantId);
                                }
                                return Mono.empty();
                            })
                    .bodyToMono(VehicleVariantResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .map(response -> {
                        if (response != null && response.getData() != null) {
                            log.debug("Successfully fetched variant info for ID: {}", variantId);
                            return response.getData();
                        }
                        log.warn("Empty response from Vehicle Service for variant {}", variantId);
                        return null;
                    })
                    .onErrorResume(WebClientResponseException.Unauthorized.class, e -> {
                        log.error("❌ 401 Unauthorized for variant {}: Vehicle Service requires authentication. " +
                                "Configure proper credentials or check service-to-service auth.", variantId);
                        return Mono.empty();
                    })
                    .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                        log.warn("Variant {} not found (404)", variantId);
                        return Mono.empty();
                    })
                    .onErrorResume(Exception.class, e -> {
                        log.error("Error calling Vehicle Service for variant {}: {} - {}",
                                variantId, e.getClass().getSimpleName(), e.getMessage());
                        return Mono.empty();
                    })
                    .block();

        } catch (Exception e) {
            log.error("Unexpected error calling vehicle service for variant {}: {}",
                    variantId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Response wrapper từ Vehicle Service
     */
    @Data
    private static class VehicleVariantResponse {
        private String status;
        private String message;
        private VehicleVariantInfo data;
    }

    /**
     * DTO cho thông tin variant
     */
    @Data
    public static class VehicleVariantInfo {
        private Long id;
        private String variantName;
        private String modelName;
        private String color;
        private Integer year;
        private Double price;
    }
}

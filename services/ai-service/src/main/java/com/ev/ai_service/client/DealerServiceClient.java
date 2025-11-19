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
import java.util.UUID;

/**
 * Client để gọi Dealer Service API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DealerServiceClient {
    
    private final WebClient.Builder webClientBuilder;
    
    @Value("${dealer.service.url:http://localhost:8083}")
    private String dealerServiceUrl;
    
    /**
     * Lấy thông tin dealer từ Dealer Service
     * Fix: 401 Unauthorized, Encoding, Null validation
     */
    public DealerInfo getDealerInfo(UUID dealerId) {
        // Validation
        if (dealerId == null) {
            log.warn("Invalid dealer ID: null");
            return null;
        }
        
        try {
            log.debug("Fetching dealer info for ID: {}", dealerId);
            
            return webClientBuilder
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.name())
                .build()
                .get()
                .uri(dealerServiceUrl + "/api/dealers/" + dealerId)
                .acceptCharset(StandardCharsets.UTF_8)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError(),
                    response -> {
                        if (response.statusCode().value() == 401) {
                            log.error("401 Unauthorized when calling Dealer Service for dealer {}", dealerId);
                        } else if (response.statusCode().value() == 404) {
                            log.warn("Dealer {} not found", dealerId);
                        }
                        return Mono.empty();
                    }
                )
                .bodyToMono(DealerResponse.class)
                .timeout(Duration.ofSeconds(5))
                .map(response -> {
                    if (response != null && response.getData() != null) {
                        log.debug("Successfully fetched dealer info for ID: {}", dealerId);
                        return response.getData();
                    }
                    return null;
                })
                .onErrorResume(WebClientResponseException.Unauthorized.class, e -> {
                    log.error("❌ 401 Unauthorized for dealer {}: Check authentication", dealerId);
                    return Mono.empty();
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("Error calling Dealer Service for dealer {}: {}", 
                        dealerId, e.getMessage());
                    return Mono.empty();
                })
                .block();
                
        } catch (Exception e) {
            log.error("Unexpected error calling dealer service for dealer {}: {}", 
                dealerId, e.getMessage());
            return null;
        }
    }
    
    /**
     * Response wrapper từ Dealer Service
     */
    @Data
    private static class DealerResponse {
        private String status;
        private String message;
        private DealerInfo data;
    }
    
    /**
     * DTO cho thông tin dealer
     */
    @Data
    public static class DealerInfo {
        private UUID id;
        private String dealerName;
        private String region;
        private String city;
        private String address;
        private String phoneNumber;
        private String email;
    }
}

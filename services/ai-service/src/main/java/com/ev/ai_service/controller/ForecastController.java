package com.ev.ai_service.controller;

<<<<<<< HEAD
import com.ev.ai_service.service.GeminiAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
=======
import com.ev.ai_service.dto.*;
import com.ev.ai_service.service.DemandForecastService;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * REST API Controller cho Demand Forecasting
 */
@RestController
@RequestMapping("/api/ai/forecast")
>>>>>>> newrepo/main
@RequiredArgsConstructor
@Slf4j
public class ForecastController {

<<<<<<< HEAD
    private final GeminiAIService geminiAIService;

    @GetMapping(value = "/forecast/{variantId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSalesForecast(@PathVariable String variantId) {
        log.info("Received forecast request for variantId: {}", variantId);
        String forecastJson = geminiAIService.generateForecast(variantId);
        return ResponseEntity.ok(forecastJson);
=======
    private final DemandForecastService forecastService;

    /**
     * Tạo dự báo nhu cầu
     * POST /api/ai/forecast/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiRespond<ForecastResponse>> generateForecast(
            @RequestBody ForecastRequest request) {
        log.info("Generating forecast for request: {}", request);

        try {
            ForecastResponse response = forecastService.generateForecast(request);
            return ResponseEntity.ok(
                    ApiRespond.success("Forecast generated successfully", response));
        } catch (Exception e) {
            log.error("Error generating forecast: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
    }

    /**
     * Lấy dự báo theo region
     * GET /api/ai/forecast/region/{region}
     */
    @GetMapping("/region/{region}")
    public ResponseEntity<ApiRespond<List<ForecastResult>>> getForecastByRegion(
            @PathVariable String region,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting forecast for region: {} from {} to {}", region, startDate, endDate);

        try {
            List<ForecastResult> results = forecastService.getForecastByRegion(
                    region, startDate, endDate);
            return ResponseEntity.ok(
                    ApiRespond.success("Forecast retrieved successfully", results));
        } catch (Exception e) {
            log.error("Error getting forecast by region: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
    }

    /**
     * Lấy dự báo theo dealer
     * GET /api/ai/forecast/dealer/{dealerId}
     */
    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<ApiRespond<List<ForecastResult>>> getForecastByDealer(
            @PathVariable UUID dealerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting forecast for dealer: {} from {} to {}", dealerId, startDate, endDate);

        try {
            List<ForecastResult> results = forecastService.getForecastByDealer(
                    dealerId, startDate, endDate);
            return ResponseEntity.ok(
                    ApiRespond.success("Forecast retrieved successfully", results));
        } catch (Exception e) {
            log.error("Error getting forecast by dealer: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
    }

    /**
     * Dự báo nhanh cho một variant
     * GET /api/ai/forecast/variant/{variantId}
     */
    @GetMapping("/variant/{variantId}")
    public ResponseEntity<ApiRespond<ForecastResponse>> quickForecast(
            @PathVariable Long variantId,
            @RequestParam(defaultValue = "30") Integer daysToForecast,
            @RequestParam(defaultValue = "AUTO") String method) {
        log.info("Quick forecast for variant: {}", variantId);

        try {
            ForecastRequest request = ForecastRequest.builder()
                    .variantId(variantId)
                    .daysToForecast(daysToForecast)
                    .forecastMethod(method)
                    .build();

            ForecastResponse response = forecastService.generateForecast(request);
            return ResponseEntity.ok(
                    ApiRespond.success("Quick forecast generated successfully", response));
        } catch (Exception e) {
            log.error("Error in quick forecast: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
>>>>>>> newrepo/main
    }
}

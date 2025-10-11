package com.ev.dealerservice.controller;

import com.ev.dealerservice.dto.request.DealerRequest;
import com.ev.dealerservice.dto.response.ApiResponse;
import com.ev.dealerservice.dto.response.DealerResponse;
import com.ev.dealerservice.service.DealerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dealers")
@RequiredArgsConstructor
public class DealerController {

    private final DealerService dealerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DealerResponse>>> getAllDealers(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search) {
        List<DealerResponse> dealers;
        
        if (search != null && !search.isEmpty()) {
            dealers = dealerService.searchDealers(search);
        } else if (city != null && !city.isEmpty()) {
            dealers = dealerService.getDealersByCity(city);
        } else {
            dealers = dealerService.getAllDealers();
        }
        
        return ResponseEntity.ok(ApiResponse.success(dealers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DealerResponse>> getDealerById(@PathVariable Long id) {
        DealerResponse dealer = dealerService.getDealerById(id);
        return ResponseEntity.ok(ApiResponse.success(dealer));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<DealerResponse>> getDealerByCode(@PathVariable String code) {
        DealerResponse dealer = dealerService.getDealerByCode(code);
        return ResponseEntity.ok(ApiResponse.success(dealer));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DealerResponse>> createDealer(@Valid @RequestBody DealerRequest request) {
        DealerResponse dealer = dealerService.createDealer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dealer created successfully", dealer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DealerResponse>> updateDealer(
            @PathVariable Long id,
            @Valid @RequestBody DealerRequest request) {
        DealerResponse dealer = dealerService.updateDealer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dealer updated successfully", dealer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDealer(@PathVariable Long id) {
        dealerService.deleteDealer(id);
        return ResponseEntity.ok(ApiResponse.success("Dealer deleted successfully", null));
    }
}

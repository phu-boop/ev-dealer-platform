package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.FeedbackRequest;
import com.ev.customer_service.dto.response.ApiResponse;
import com.ev.customer_service.entity.CustomerFeedback;
import com.ev.customer_service.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<ApiResponse<List<CustomerFeedback>>> getFeedbackByDealer(@PathVariable Long dealerId) {
        List<CustomerFeedback> feedbacks = feedbackService.getFeedbackByDealerId(dealerId);
        return ResponseEntity.ok(ApiResponse.success(feedbacks));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerFeedback>> createFeedback(@Valid @RequestBody FeedbackRequest request) {
        CustomerFeedback feedback = feedbackService.createFeedback(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully", feedback));
    }
}

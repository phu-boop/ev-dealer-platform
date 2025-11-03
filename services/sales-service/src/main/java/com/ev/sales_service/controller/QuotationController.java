package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.QuotationCalculateRequest;
import com.ev.sales_service.dto.request.QuotationCreateRequest;
import com.ev.sales_service.dto.request.QuotationFilterRequest;
import com.ev.sales_service.dto.request.QuotationSendRequest;
import com.ev.sales_service.dto.response.CustomerResponseRequest;
import com.ev.sales_service.dto.response.PromotionResponse;
import com.ev.sales_service.dto.response.QuotationResponse;
import com.ev.sales_service.service.Interface.QuotationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.ev.common_lib.dto.respond.ApiRespond;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
@Validated
@Slf4j
public class QuotationController {
    private final QuotationService quotationService;

    @PostMapping("/draft")
    public ResponseEntity<ApiRespond<QuotationResponse>> createDraftQuotation(
            @RequestBody @Valid QuotationCreateRequest request) {
        QuotationResponse response = quotationService.createDraftQuotation(request);
        return ResponseEntity.ok(ApiRespond.success("Quotation created successfully", response));
    }

    @PutMapping("/{quotationId}/calculate")
    public ResponseEntity<ApiRespond<QuotationResponse>> calculateQuotationPrice(
            @PathVariable UUID quotationId,
            @RequestBody @Valid QuotationCalculateRequest request) {
        QuotationResponse response = quotationService.calculateQuotationPrice(quotationId, request);
        return ResponseEntity.ok(ApiRespond.success("Quotation calculated successfully", response));
    }

    @PutMapping("/{quotationId}/send")
    public ResponseEntity<ApiRespond<QuotationResponse>> sendQuotationToCustomer(
            @PathVariable UUID quotationId,
            @RequestBody @Valid QuotationSendRequest request) {
        QuotationResponse response = quotationService.sendQuotationToCustomer(quotationId, request);
        return ResponseEntity.ok(ApiRespond.success("Quotation sent to customer successfully", response));
    }

    @PutMapping("/{quotationId}/customer-response")
    public ResponseEntity<ApiRespond<QuotationResponse>> handleCustomerResponse(
            @PathVariable UUID quotationId,
            @RequestBody @Valid CustomerResponseRequest request) {
        QuotationResponse response = quotationService.handleCustomerResponse(quotationId, request);
        return ResponseEntity.ok(ApiRespond.success("Customer response handled successfully", response));
    }

//    @PostMapping("/{quotationId}/convert-to-order")
//    public ResponseEntity<ApiRespond<SalesOrderResponse>> convertToSalesOrder(@PathVariable UUID quotationId) {
//        SalesOrderResponse response = quotationService.convertToSalesOrder(quotationId);
//        return ResponseEntity.ok(ApiRespond.success("Quotation converted to order successfully", response));
//    }

    @GetMapping("/{quotationId}")
    public ResponseEntity<ApiRespond<QuotationResponse>> getQuotationById(@PathVariable UUID quotationId) {
        QuotationResponse response = quotationService.getQuotationById(quotationId);
        return ResponseEntity.ok(ApiRespond.success("Quotation fetched successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiRespond<List<QuotationResponse>>> getQuotations(
            @ModelAttribute QuotationFilterRequest filterRequest) {
        List<QuotationResponse> responses = quotationService.getQuotationsByFilters(filterRequest);
        return ResponseEntity.ok(ApiRespond.success("Quotations fetched successfully", responses));
    }

//    @GetMapping("/search")
//    public ResponseEntity<ApiRespond<Page<QuotationResponse>>> getQuotationsWithPagination(
//            @ModelAttribute QuotationFilterRequest filterRequest,
//            @PageableDefault(size = 20, sort = "quotationDate", direction = Sort.Direction.DESC) Pageable pageable) {
//        Page<QuotationResponse> responses = quotationService.getQuotationsWithPagination(filterRequest, pageable);
//        return ResponseEntity.ok(ApiRespond.success("Quotations fetched with pagination successfully", responses));
//    }

//    @GetMapping("/{quotationId}/available-promotions")
//    public ResponseEntity<ApiRespond<List<PromotionResponse>>> getAvailablePromotions(@PathVariable UUID quotationId) {
//        List<PromotionResponse> responses = quotationService.getAvailablePromotionsForQuotation(quotationId);
//        return ResponseEntity.ok(ApiRespond.success("Available promotions fetched successfully", responses));
//    }
}
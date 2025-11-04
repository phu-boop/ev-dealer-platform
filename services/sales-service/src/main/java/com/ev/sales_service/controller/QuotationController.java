package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.QuotationCalculateRequest;
import com.ev.sales_service.dto.request.QuotationCreateRequest;
import com.ev.sales_service.dto.request.QuotationFilterRequest;
import com.ev.sales_service.dto.request.QuotationSendRequest;
import com.ev.sales_service.dto.response.CustomerResponseRequest;
import com.ev.sales_service.dto.response.QuotationResponse;
import com.ev.sales_service.service.Interface.QuotationService;
import com.ev.common_lib.dto.respond.ApiRespond;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
        log.info("Creating draft quotation for customer: {}", request.getCustomerId());
        QuotationResponse response = quotationService.createDraftQuotation(request);
        return ResponseEntity.ok(ApiRespond.success("Quotation created successfully", response));
    }

    @PutMapping("/{quotationId}/calculate")
    public ResponseEntity<ApiRespond<QuotationResponse>> calculateQuotationPrice(
            @PathVariable UUID quotationId,
            @RequestBody @Valid QuotationCalculateRequest request) {
        log.info("Calculating price for quotation: {}", quotationId);
        QuotationResponse response = quotationService.calculateQuotationPrice(quotationId, request);
        return ResponseEntity.ok(ApiRespond.success("Quotation calculated successfully", response));
    }

    @PutMapping("/{quotationId}/send")
    public ResponseEntity<ApiRespond<QuotationResponse>> sendQuotationToCustomer(
            @PathVariable UUID quotationId,
            @RequestBody @Valid QuotationSendRequest request) {
        log.info("Sending quotation to customer: {}", quotationId);
        QuotationResponse response = quotationService.sendQuotationToCustomer(quotationId, request);
        return ResponseEntity.ok(ApiRespond.success("Quotation sent to customer successfully", response));
    }

    @PutMapping("/{quotationId}/customer-response")
    public ResponseEntity<ApiRespond<QuotationResponse>> handleCustomerResponse(
            @PathVariable UUID quotationId,
            @RequestBody @Valid CustomerResponseRequest request) {
        log.info("Handling customer response for quotation: {}", quotationId);
        QuotationResponse response = quotationService.handleCustomerResponse(quotationId, request);
        return ResponseEntity.ok(ApiRespond.success("Customer response handled successfully", response));
    }

//    @PostMapping("/{quotationId}/convert-to-order")
//    public ResponseEntity<ApiRespond<SalesOrderResponse>> convertToSalesOrder(
//            @PathVariable UUID quotationId) {
//        log.info("Converting quotation to sales order: {}", quotationId);
//        SalesOrderResponse response = quotationService.convertToSalesOrder(quotationId);
//        return ResponseEntity.ok(ApiRespond.success("Quotation converted to order successfully", response));
//    }

    @GetMapping("/{quotationId}")
    public ResponseEntity<ApiRespond<QuotationResponse>> getQuotationById(
            @PathVariable UUID quotationId) {
        log.info("Fetching quotation by ID: {}", quotationId);
        QuotationResponse response = quotationService.getQuotationById(quotationId);
        return ResponseEntity.ok(ApiRespond.success("Quotation fetched successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiRespond<List<QuotationResponse>>> getQuotations(
            @Valid QuotationFilterRequest filterRequest) {
        log.info("Fetching quotations with filters: dealerId={}, customerId={}, status={}",
                filterRequest.getDealerId(), filterRequest.getCustomerId(), filterRequest.getStatus());
        List<QuotationResponse> responses = quotationService.getQuotationsByFilters(filterRequest);
        return ResponseEntity.ok(ApiRespond.success("Quotations fetched successfully", responses));
    }

//    @GetMapping("/search")
//    public ResponseEntity<ApiRespond<Page<QuotationResponse>>> getQuotationsWithPagination(
//            @Valid QuotationFilterRequest filterRequest,
//            @PageableDefault(size = 20, sort = "quotationDate", direction = Sort.Direction.DESC) Pageable pageable) {
//        Page<QuotationResponse> responses = quotationService.getQuotationsWithPagination(filterRequest, pageable);
//        return ResponseEntity.ok(ApiRespond.success("Quotations fetched with pagination successfully", responses));
//    }

//    @GetMapping("/{quotationId}/available-promotions")
//    public ResponseEntity<ApiRespond<List<PromotionResponse>>> getAvailablePromotions(
//            @PathVariable UUID quotationId) {
//        List<PromotionResponse> responses = quotationService.getAvailablePromotionsForQuotation(quotationId);
//        return ResponseEntity.ok(ApiRespond.success("Available promotions fetched successfully", responses));
//    }
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<ApiRespond<List<QuotationResponse>>> getQuotationsByStaff(
            @PathVariable UUID staffId) {
        log.info("Fetching quotations for staff: {}", staffId);
        List<QuotationResponse> responses = quotationService.getQuotationsByStaff(staffId);
        return ResponseEntity.ok(ApiRespond.success("Quotations fetched successfully for staff", responses));
    }

    @GetMapping("/dealer/{dealerId}")
public ResponseEntity<ApiRespond<List<QuotationResponse>>> getQuotationsByDealer(
        @PathVariable UUID dealerId) {
    log.info("Fetching quotations for dealer: {}", dealerId);
    List<QuotationResponse> responses = quotationService.getQuotationsByDealer(dealerId);
    return ResponseEntity.ok(ApiRespond.success("Quotations fetched successfully for dealer", responses));
}
@DeleteMapping("/{quotationId}")
public ResponseEntity<ApiRespond<String>> deleteQuotation(
        @PathVariable UUID quotationId) {
    log.info("Deleting quotation: {}", quotationId);
    quotationService.deleteQuotation(quotationId);
    return ResponseEntity.ok(ApiRespond.success("Quotation deleted successfully", "Deleted"));
}


}
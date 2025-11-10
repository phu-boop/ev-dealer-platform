package com.ev.sales_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.response.CustomerResponseRequest;
import com.ev.sales_service.dto.response.QuotationResponse;
import com.ev.sales_service.service.Interface.QuotationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.UUID;

@Controller
@RequestMapping("/sendmail/customer-response")
@RequiredArgsConstructor
@Slf4j
public class CustomerResponseController {

    private final QuotationService quotationService;

    @GetMapping("/quotation/{quotationId}/accept")
    public ModelAndView acceptQuotation(@PathVariable UUID quotationId) {
        log.info("Customer accepting quotation via direct link: {}", quotationId);

        try {
            CustomerResponseRequest request = CustomerResponseRequest.builder()
                    .accepted(true)
                    .customerNote("Accepted via email link")
                    .build();

            QuotationResponse response = quotationService.handleCustomerResponse(quotationId, request);

            // Return success page
            ModelAndView modelAndView = new ModelAndView("response-success");
            modelAndView.addObject("quotationId", quotationId);
            modelAndView.addObject("action", "accepted");
            modelAndView.addObject("message", "Báo giá đã được chấp nhận thành công!");
            return modelAndView;

        } catch (Exception e) {
            log.error("Error accepting quotation {}: {}", quotationId, e.getMessage());
            return createErrorPage("Lỗi khi chấp nhận báo giá: " + e.getMessage());
        }
    }

    @GetMapping("/quotation/{quotationId}/reject")
    public ModelAndView rejectQuotation(@PathVariable UUID quotationId) {
        log.info("Customer rejecting quotation via direct link: {}", quotationId);

        try {
            CustomerResponseRequest request = CustomerResponseRequest.builder()
                    .accepted(false)
                    .customerNote("Rejected via email link")
                    .build();

            QuotationResponse response = quotationService.handleCustomerResponse(quotationId, request);

            // Return success page
            ModelAndView modelAndView = new ModelAndView("response-success");
            modelAndView.addObject("quotationId", quotationId);
            modelAndView.addObject("action", "rejected");
            modelAndView.addObject("message", "Báo giá đã được từ chối thành công!");
            return modelAndView;

        } catch (Exception e) {
            log.error("Error rejecting quotation {}: {}", quotationId, e.getMessage());
            return createErrorPage("Lỗi khi từ chối báo giá: " + e.getMessage());
        }
    }

    // API endpoints (optional - for programmatic calls)
    @PostMapping("/quotation/{quotationId}/accept")
    public ResponseEntity<ApiRespond<QuotationResponse>> acceptQuotationApi(@PathVariable UUID quotationId) {
        try {
            CustomerResponseRequest request = CustomerResponseRequest.builder()
                    .accepted(true)
                    .customerNote("Accepted via API")
                    .build();

            QuotationResponse response = quotationService.handleCustomerResponse(quotationId, request);
            return ResponseEntity.ok(ApiRespond.success("Quotation accepted successfully", response));

        } catch (Exception e) {
            log.error("API Error accepting quotation {}: {}", quotationId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiRespond.error("9999","API Error accepting quotation",null));
        }
    }

    @PostMapping("/quotation/{quotationId}/reject")
    public ResponseEntity<ApiRespond<QuotationResponse>> rejectQuotationApi(@PathVariable UUID quotationId) {
        try {
            CustomerResponseRequest request = CustomerResponseRequest.builder()
                    .accepted(false)
                    .customerNote("Rejected via API")
                    .build();

            QuotationResponse response = quotationService.handleCustomerResponse(quotationId, request);
            return ResponseEntity.ok(ApiRespond.success("Quotation rejected successfully", response));

        } catch (Exception e) {
            log.error("API Error rejecting quotation {}: {}", quotationId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiRespond.error("9999","API Error rejecting quotation ",null));
        }
    }

    private ModelAndView createErrorPage(String errorMessage) {
        ModelAndView modelAndView = new ModelAndView("response-error");
        modelAndView.addObject("errorMessage", errorMessage);
        return modelAndView;
    }
}
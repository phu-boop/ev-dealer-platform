package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import com.ev.customer_service.service.CustomerService;
import com.ev.common_lib.dto.respond.ApiRespond;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiRespond<List<CustomerResponse>>> getAllCustomers(
            @RequestParam(required = false) String search) {
        List<CustomerResponse> customers;

        if (search != null && !search.isEmpty()) {
            customers = customerService.searchCustomers(search);
        } else {
            customers = customerService.getAllCustomers();
        }

        return ResponseEntity.ok(ApiRespond.success("Customers retrieved successfully", customers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiRespond<CustomerResponse>> getCustomerById(@PathVariable String id) {
        Long customerId = Long.parseLong(id);
        CustomerResponse customer = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(ApiRespond.success("Customer retrieved successfully", customer));
    }

    @PostMapping
    public ResponseEntity<ApiRespond<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse customer = customerService.createCustomer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiRespond.success("Customer created successfully", customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiRespond<CustomerResponse>> updateCustomer(
            @PathVariable String id,
            @Valid @RequestBody CustomerRequest request,
            @RequestHeader(value = "X-Modified-By", required = false) String modifiedBy) {
        Long customerId = Long.parseLong(id);
        try {
            com.ev.customer_service.util.RequestContext.setCurrentUser(modifiedBy);
            CustomerResponse customer = customerService.updateCustomer(customerId, request);
            return ResponseEntity.ok(ApiRespond.success("Customer updated successfully", customer));
        } finally {
            com.ev.customer_service.util.RequestContext.clear();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRespond<Void>> deleteCustomer(@PathVariable String id) {
        Long customerId = Long.parseLong(id);
        customerService.deleteCustomer(customerId);
        return ResponseEntity.ok(ApiRespond.success("Customer deleted successfully", (Void) null));
    }

    /**
     * Get available customer statuses
     * GET /customers/enums/statuses
     */
    @GetMapping("/enums/statuses")
    public ResponseEntity<ApiRespond<List<Map<String, String>>>> getCustomerStatuses() {
        List<Map<String, String>> statuses = Arrays.stream(CustomerStatus.values())
                .map(status -> Map.of(
                    "value", status.name(),
                    "displayName", status.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiRespond.success("Customer statuses retrieved successfully", statuses));
    }

    /**
     * Get available customer types
     * GET /customers/enums/types
     */
    @GetMapping("/enums/types")
    public ResponseEntity<ApiRespond<List<Map<String, String>>>> getCustomerTypes() {
        List<Map<String, String>> types = Arrays.stream(CustomerType.values())
                .map(type -> Map.of(
                    "value", type.name(),
                    "displayName", type.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiRespond.success("Customer types retrieved successfully", types));
    }

    /**
     * Get audit history for a customer
     * GET /customers/{id}/audit-history
     */
    @GetMapping("/{id}/audit-history")
    public ResponseEntity<ApiRespond<List<com.ev.customer_service.dto.response.AuditResponse>>> getCustomerAuditHistory(@PathVariable String id) {
        Long customerId = Long.parseLong(id);
        List<com.ev.customer_service.dto.response.AuditResponse> audits = customerService.getCustomerAuditHistory(customerId);
        return ResponseEntity.ok(ApiRespond.success("Audit history retrieved successfully", audits));
    }
}

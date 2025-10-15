package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.service.CustomerService;
import com.ev.common_lib.dto.respond.ApiRespond;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @Valid @RequestBody CustomerRequest request) {
        Long customerId = Long.parseLong(id);
        CustomerResponse customer = customerService.updateCustomer(customerId, request);
        return ResponseEntity.ok(ApiRespond.success("Customer updated successfully", customer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRespond<Void>> deleteCustomer(@PathVariable String id) {
        Long customerId = Long.parseLong(id);
        customerService.deleteCustomer(customerId);
        return ResponseEntity.ok(ApiRespond.success("Customer deleted successfully", (Void) null));
    }
}

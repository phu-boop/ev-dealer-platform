package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.exception.DuplicateResourceException;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;
    private final com.ev.customer_service.repository.CustomerProfileAuditRepository auditRepository;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customer -> modelMapper.map(customer, CustomerResponse.class))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return modelMapper.map(customer, CustomerResponse.class);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String keyword) {
        return customerRepository.searchCustomers(keyword).stream()
                .map(customer -> modelMapper.map(customer, CustomerResponse.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Check email duplication
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + request.getEmail() + " already exists");
        }

        // Check phone duplication
        if (request.getPhone() != null && !request.getPhone().isEmpty() && 
            customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        // Check ID number duplication
        if (request.getIdNumber() != null && customerRepository.existsByIdNumber(request.getIdNumber())) {
            throw new DuplicateResourceException("Customer with ID number " + request.getIdNumber() + " already exists");
        }

        Customer customer = modelMapper.map(request, Customer.class);
        
        // Auto-generate customer code: CUS-YYYYMMDD-XXXX
        customer.setCustomerCode(generateCustomerCode());
        
        Customer savedCustomer = customerRepository.save(customer);
        return modelMapper.map(savedCustomer, CustomerResponse.class);
    }

    /**
     * Generate unique customer code with format: CUS-YYYYMMDD-XXXX
     */
    private String generateCustomerCode() {
        String datePrefix = java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // Find the last customer created today
        long count = customerRepository.count();
        String sequence = String.format("%04d", (count % 10000) + 1);
        
        return "CUS-" + datePrefix + "-" + sequence;
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        // Check email duplication
        if (!customer.getEmail().equals(request.getEmail()) &&
            customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + request.getEmail() + " already exists");
        }

        // Check phone duplication
        if (request.getPhone() != null && !request.getPhone().isEmpty() &&
            !request.getPhone().equals(customer.getPhone()) &&
            customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        // Check ID number duplication
        if (request.getIdNumber() != null &&
            !request.getIdNumber().equals(customer.getIdNumber()) &&
            customerRepository.existsByIdNumber(request.getIdNumber())) {
            throw new DuplicateResourceException("Customer with ID number " + request.getIdNumber() + " already exists");
        }

    // Capture old values for audit
    String oldPhone = customer.getPhone();
    String oldAddress = customer.getAddress();
    String oldStatus = customer.getStatus();

    // Manually update fields to avoid overwriting relationships and managed fields
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setIdNumber(request.getIdNumber());
        customer.setCustomerType(request.getCustomerType());
        customer.setRegistrationDate(request.getRegistrationDate());
        customer.setStatus(request.getStatus());
        customer.setPreferredDealerId(request.getPreferredDealerId());
        // Don't update customerCode, customerId, createdAt, updatedAt, or relationships
        
        Customer updatedCustomer = customerRepository.save(customer);

        // Record audit if relevant fields changed (phone, address, status)
        java.util.Map<String, Object> changes = new java.util.HashMap<>();
        if (oldPhone == null ? request.getPhone() != null : !oldPhone.equals(request.getPhone())) {
            changes.put("phone", java.util.Map.of("old", oldPhone, "new", request.getPhone()));
        }
        if (oldAddress == null ? request.getAddress() != null : !oldAddress.equals(request.getAddress())) {
            changes.put("address", java.util.Map.of("old", oldAddress, "new", request.getAddress()));
        }
        if (oldStatus == null ? request.getStatus() != null : !oldStatus.equals(request.getStatus())) {
            changes.put("status", java.util.Map.of("old", oldStatus, "new", request.getStatus()));
        }

        if (!changes.isEmpty()) {
            com.ev.customer_service.entity.CustomerProfileAudit audit = new com.ev.customer_service.entity.CustomerProfileAudit();
            audit.setCustomerId(updatedCustomer.getCustomerId());
            // modifiedBy will be set by controller via header and passed through ThreadLocal or param; default to 'system' here
            audit.setChangedBy(java.util.Optional.ofNullable(com.ev.customer_service.util.RequestContext.getCurrentUser()).orElse("system"));
            try {
                String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(changes);
                audit.setChangesJson(json);
            } catch (Exception ex) {
                audit.setChangesJson(changes.toString());
            }
            auditRepository.save(audit);
        }
        return modelMapper.map(updatedCustomer, CustomerResponse.class);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }
}

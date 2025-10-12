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

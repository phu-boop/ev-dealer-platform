package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.FeedbackRequest;
import com.ev.customer_service.dto.response.ApiResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.CustomerFeedback;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerFeedbackRepository;
import com.ev.customer_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final CustomerFeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<CustomerFeedback> getFeedbackByDealerId(Long dealerId) {
        // Note: This would need a join with order/sales to get dealer info
        return feedbackRepository.findAll();
    }

    @Transactional
    public CustomerFeedback createFeedback(FeedbackRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        CustomerFeedback feedback = modelMapper.map(request, CustomerFeedback.class);
        feedback.setCustomer(customer);
        return feedbackRepository.save(feedback);
    }
}

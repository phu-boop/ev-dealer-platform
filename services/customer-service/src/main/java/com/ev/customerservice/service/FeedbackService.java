package com.ev.customerservice.service;

import com.ev.customerservice.dto.request.FeedbackRequest;
import com.ev.customerservice.dto.response.ApiResponse;
import com.ev.customerservice.entity.Customer;
import com.ev.customerservice.entity.CustomerFeedback;
import com.ev.customerservice.exception.ResourceNotFoundException;
import com.ev.customerservice.repository.CustomerFeedbackRepository;
import com.ev.customerservice.repository.CustomerRepository;
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

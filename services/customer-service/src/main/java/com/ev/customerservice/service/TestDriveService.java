package com.ev.customerservice.service;

import com.ev.customerservice.dto.request.TestDriveRequest;
import com.ev.customerservice.dto.response.TestDriveResponse;
import com.ev.customerservice.entity.Customer;
import com.ev.customerservice.entity.TestDriveAppointment;
import com.ev.customerservice.exception.ResourceNotFoundException;
import com.ev.customerservice.repository.CustomerRepository;
import com.ev.customerservice.repository.TestDriveAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestDriveService {

    private final TestDriveAppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<TestDriveResponse> getAppointmentsByDealerId(Long dealerId) {
        return appointmentRepository.findByDealerId(dealerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestDriveResponse getAppointmentById(Long id) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return mapToResponse(appointment);
    }

    @Transactional
    public TestDriveResponse createAppointment(TestDriveRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        TestDriveAppointment appointment = modelMapper.map(request, TestDriveAppointment.class);
        appointment.setCustomer(customer);
        if (appointment.getStatus() == null) {
            appointment.setStatus("SCHEDULED");
        }
        
        TestDriveAppointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(savedAppointment);
    }

    @Transactional
    public TestDriveResponse updateAppointment(Long id, TestDriveRequest request) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        modelMapper.map(request, appointment);
        TestDriveAppointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(updatedAppointment);
    }

    private TestDriveResponse mapToResponse(TestDriveAppointment appointment) {
        TestDriveResponse response = modelMapper.map(appointment, TestDriveResponse.class);
        response.setCustomerId(appointment.getCustomer().getCustomerId());
        response.setCustomerName(appointment.getCustomer().getFirstName() + " " + appointment.getCustomer().getLastName());
        return response;
    }
}

package com.ev.customer_service.service;

import com.ev.customer_service.client.NotificationServiceClient;
import com.ev.customer_service.client.UserServiceClient;
import com.ev.customer_service.dto.request.AssignStaffRequest;
import com.ev.customer_service.dto.response.AssignmentResponse;
import com.ev.customer_service.dto.response.StaffDTO;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service để quản lý phân công nhân viên cho khách hàng
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StaffAssignmentService {

    private final CustomerRepository customerRepository;
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    /**
     * Phân công nhân viên cho khách hàng
     * 
     * @param customerId ID của khách hàng
     * @param request Request chứa staffId và note
     * @return AssignmentResponse
     */
    @Transactional
    public AssignmentResponse assignStaffToCustomer(Long customerId, AssignStaffRequest request) {
        log.info("Assigning staff {} to customer {}", request.getStaffId(), customerId);

        // 1. Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        // 2. Kiểm tra nhân viên tồn tại và active thông qua User Service
        StaffDTO staff = userServiceClient.getStaffById(request.getStaffId());
        if (staff == null) {
            throw new ResourceNotFoundException("Staff not found with id: " + request.getStaffId());
        }

        if (!Boolean.TRUE.equals(staff.getActive())) {
            throw new IllegalStateException("Staff is not active and cannot be assigned");
        }

        // 3. Lưu thông tin nhân viên cũ (nếu có) để gửi thông báo hủy phân công
        Long oldStaffId = customer.getAssignedStaffId();
        StaffDTO oldStaff = null;
        if (oldStaffId != null && !oldStaffId.equals(request.getStaffId())) {
            try {
                oldStaff = userServiceClient.getStaffById(oldStaffId);
            } catch (Exception e) {
                log.warn("Could not fetch old staff info: {}", e.getMessage());
            }
        }

        // 4. Cập nhật phân công
        customer.setAssignedStaffId(request.getStaffId());
        Customer updatedCustomer = customerRepository.save(customer);

        log.info("Successfully assigned staff {} to customer {}", request.getStaffId(), customerId);

        // 5. Gửi thông báo cho nhân viên mới được phân công
        String customerFullName = customer.getFirstName() + " " + customer.getLastName();
        try {
            notificationServiceClient.sendAssignmentNotification(
                staff.getUserId(),
                staff.getEmail(),
                customerFullName,
                customer.getCustomerCode()
            );
        } catch (Exception e) {
            log.error("Failed to send assignment notification: {}", e.getMessage());
            // Không throw exception, chỉ log lỗi
        }

        // 6. Gửi thông báo hủy phân công cho nhân viên cũ (nếu có)
        if (oldStaff != null) {
            try {
                notificationServiceClient.sendUnassignmentNotification(
                    oldStaff.getUserId(),
                    oldStaff.getEmail(),
                    customerFullName,
                    customer.getCustomerCode()
                );
            } catch (Exception e) {
                log.error("Failed to send unassignment notification: {}", e.getMessage());
            }
        }

        // 7. Tạo response
        String staffFullName = staff.getFirstName() + " " + staff.getLastName();
        AssignmentResponse response = new AssignmentResponse();
        response.setCustomerId(updatedCustomer.getCustomerId());
        response.setCustomerCode(updatedCustomer.getCustomerCode());
        response.setCustomerName(customerFullName);
        response.setAssignedStaffId(request.getStaffId());
        response.setAssignedStaffName(staffFullName);
        response.setAssignedAt(LocalDateTime.now());
        response.setMessage("Staff assigned successfully and notification sent");

        return response;
    }

    /**
     * Hủy phân công nhân viên cho khách hàng
     * 
     * @param customerId ID của khách hàng
     * @return AssignmentResponse
     */
    @Transactional
    public AssignmentResponse unassignStaffFromCustomer(Long customerId) {
        log.info("Unassigning staff from customer {}", customerId);

        // 1. Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        // 2. Kiểm tra xem customer có được phân công nhân viên không
        if (customer.getAssignedStaffId() == null) {
            throw new IllegalStateException("Customer is not assigned to any staff");
        }

        Long oldStaffId = customer.getAssignedStaffId();
        
        // 3. Lấy thông tin nhân viên cũ để gửi thông báo
        StaffDTO oldStaff = null;
        try {
            oldStaff = userServiceClient.getStaffById(oldStaffId);
        } catch (Exception e) {
            log.warn("Could not fetch staff info: {}", e.getMessage());
        }

        // 4. Hủy phân công
        customer.setAssignedStaffId(null);
        Customer updatedCustomer = customerRepository.save(customer);

        log.info("Successfully unassigned staff from customer {}", customerId);

        // 5. Gửi thông báo hủy phân công
        if (oldStaff != null) {
            String customerFullName = customer.getFirstName() + " " + customer.getLastName();
            try {
                notificationServiceClient.sendUnassignmentNotification(
                    oldStaff.getUserId(),
                    oldStaff.getEmail(),
                    customerFullName,
                    customer.getCustomerCode()
                );
            } catch (Exception e) {
                log.error("Failed to send unassignment notification: {}", e.getMessage());
            }
        }

        // 6. Tạo response
        String customerFullName = customer.getFirstName() + " " + customer.getLastName();
        AssignmentResponse response = new AssignmentResponse();
        response.setCustomerId(updatedCustomer.getCustomerId());
        response.setCustomerCode(updatedCustomer.getCustomerCode());
        response.setCustomerName(customerFullName);
        response.setAssignedStaffId(null);
        response.setAssignedStaffName(null);
        response.setAssignedAt(LocalDateTime.now());
        response.setMessage("Staff unassigned successfully");

        return response;
    }

    /**
     * Lấy thông tin nhân viên được phân công cho khách hàng
     * 
     * @param customerId ID của khách hàng
     * @return StaffDTO hoặc null nếu chưa được phân công
     */
    @Transactional(readOnly = true)
    public StaffDTO getAssignedStaff(Long customerId) {
        log.info("Getting assigned staff for customer {}", customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (customer.getAssignedStaffId() == null) {
            return null;
        }

        try {
            return userServiceClient.getStaffById(customer.getAssignedStaffId());
        } catch (Exception e) {
            log.error("Error fetching assigned staff info: {}", e.getMessage());
            throw new RuntimeException("Unable to fetch assigned staff information", e);
        }
    }
}

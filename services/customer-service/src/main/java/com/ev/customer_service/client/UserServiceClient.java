package com.ev.customer_service.client;

import com.ev.customer_service.dto.response.StaffDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Client để gọi API từ User Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestTemplate restTemplate;

    // TODO: Thay thế URL này bằng URL thực tế của User Service khi bạn bè làm xong
    // Ví dụ: http://localhost:8081/api/users hoặc http://user-service:8081/api/users
    @Value("${user.service.url:http://localhost:8081/api/users}")
    private String userServiceUrl;

    /**
     * Lấy thông tin nhân viên theo ID
     * TODO: Cập nhật endpoint URL khi User Service hoàn thành
     * Endpoint dự kiến: GET /api/users/{userId}
     */
    public StaffDTO getStaffById(Long staffId) {
        try {
            String url = userServiceUrl + "/" + staffId;
            log.info("Calling User Service to get staff info: {}", url);
            
            // TODO: Thay đổi response structure nếu User Service trả về format khác
            ResponseEntity<StaffDTO> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                StaffDTO.class
            );
            
            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling User Service for staffId {}: {}", staffId, e.getMessage());
            throw new RuntimeException("Unable to fetch staff information from User Service", e);
        }
    }

    /**
     * Lấy danh sách tất cả nhân viên
     * TODO: Cập nhật endpoint URL khi User Service hoàn thành
     * Endpoint dự kiến: GET /api/users?role=STAFF hoặc GET /api/staff
     */
    public List<StaffDTO> getAllStaff() {
        try {
            // TODO: Cập nhật URL và query params phù hợp với API của User Service
            String url = userServiceUrl + "?role=STAFF";
            log.info("Calling User Service to get all staff: {}", url);
            
            ResponseEntity<List<StaffDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StaffDTO>>() {}
            );
            
            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling User Service to get all staff: {}", e.getMessage());
            throw new RuntimeException("Unable to fetch staff list from User Service", e);
        }
    }

    /**
     * Kiểm tra xem nhân viên có tồn tại và đang hoạt động không
     * TODO: Cập nhật logic nếu cần
     */
    public boolean isStaffActive(Long staffId) {
        try {
            StaffDTO staff = getStaffById(staffId);
            return staff != null && Boolean.TRUE.equals(staff.getActive());
        } catch (Exception e) {
            log.error("Error checking staff status for staffId {}: {}", staffId, e.getMessage());
            return false;
        }
    }
}

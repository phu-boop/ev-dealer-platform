package com.ev.customer_service.service;

import com.ev.customer_service.dto.NotificationRequest;
import com.ev.customer_service.dto.request.*;
import com.ev.customer_service.dto.response.ComplaintResponse;
import com.ev.customer_service.dto.response.ComplaintStatisticsResponse;
import com.ev.customer_service.entity.Complaint;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.ComplaintRepository;
import com.ev.customer_service.repository.CustomerRepository;
import com.ev.customer_service.specification.ComplaintSpecification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý logic nghiệp vụ cho Quản lý Phản hồi & Khiếu nại
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper;
    // TODO: Add KafkaTemplate when Kafka is configured
    // private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Tạo mới phản hồi/khiếu nại
     * Dealer Staff ghi nhận từ khách hàng
     */
    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request) {
        log.info("Creating new complaint for customer: {}", request.getCustomerId());

        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        // Create complaint entity
        Complaint complaint = new Complaint();
        complaint.setComplaintCode(generateComplaintCode());
        complaint.setCustomer(customer);
        complaint.setDealerId(request.getDealerId());
        complaint.setOrderId(request.getOrderId());
        complaint.setComplaintType(request.getComplaintType());
        complaint.setSeverity(request.getSeverity());
        complaint.setChannel(request.getChannel());
        complaint.setDescription(request.getDescription());
        complaint.setStatus(ComplaintStatus.NEW); // Mặc định là NEW
        complaint.setCreatedByStaffId(request.getCreatedByStaffId());
        complaint.setCreatedByStaffName(request.getCreatedByStaffName());
        complaint.setNotificationSent(false);

        Complaint saved = complaintRepository.save(complaint);
        log.info("Complaint created successfully with code: {}", saved.getComplaintCode());

        return mapToResponse(saved);
    }

    /**
     * Phân công xử lý phản hồi
     * Dealer Manager gán nhân viên và chuyển trạng thái
     */
    @Transactional
    public ComplaintResponse assignComplaint(Long complaintId, AssignComplaintRequest request) {
        log.info("Assigning complaint {} to staff {}", complaintId, request.getAssignedStaffId());

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        complaint.setAssignedStaffId(request.getAssignedStaffId());
        complaint.setAssignedStaffName(request.getAssignedStaffName());
        complaint.setInternalNotes(request.getInternalNotes());

        if (request.getStatus() != null) {
            complaint.setStatus(request.getStatus());
        } else {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS); // Default khi gán
        }

        // Ghi lại thời gian phản hồi đầu tiên (SLA tracking)
        if (complaint.getFirstResponseAt() == null) {
            complaint.setFirstResponseAt(LocalDateTime.now());
        }

        Complaint saved = complaintRepository.save(complaint);

        // TODO: Gửi notification cho staff được gán
        sendNotificationToStaff(saved, "Bạn được gán xử lý phản hồi " + saved.getComplaintCode());

        return mapToResponse(saved);
    }

    /**
     * Cập nhật tiến độ xử lý
     * Staff thêm update note
     */
    @Transactional
    public ComplaintResponse addProgressUpdate(Long complaintId, ComplaintProgressUpdate update) {
        log.info("Adding progress update to complaint {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        // Parse existing progress updates
        List<ComplaintResponse.ProgressUpdateInfo> progressList = parseProgressUpdates(complaint.getProgressUpdates());

        // Add new update
        ComplaintResponse.ProgressUpdateInfo newUpdate = ComplaintResponse.ProgressUpdateInfo.builder()
                .updateNote(update.getUpdateNote())
                .updatedByStaffId(update.getUpdatedByStaffId())
                .updatedByStaffName(update.getUpdatedByStaffName())
                .updatedAt(LocalDateTime.now())
                .build();
        progressList.add(newUpdate);

        // Save back as JSON
        complaint.setProgressUpdates(serializeProgressUpdates(progressList));

        Complaint saved = complaintRepository.save(complaint);
        return mapToResponse(saved);
    }

    /**
     * Đánh dấu phản hồi đã giải quyết
     * Staff hoàn thành xử lý
     */
    @Transactional
    public ComplaintResponse resolveComplaint(Long complaintId, ResolveComplaintRequest request) {
        log.info("Resolving complaint {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResolution(request.getResolution());
        complaint.setResolvedDate(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        // Gửi notification cho khách hàng nếu yêu cầu
        if (Boolean.TRUE.equals(request.getSendNotification())) {
            sendResolutionNotificationToCustomer(saved);
        }

        return mapToResponse(saved);
    }

    /**
     * Đóng phản hồi
     * Manager xác nhận đóng sau khi resolved
     */
    @Transactional
    public ComplaintResponse closeComplaint(Long complaintId) {
        log.info("Closing complaint {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (!complaint.getStatus().equals(ComplaintStatus.RESOLVED)) {
            throw new IllegalStateException("Can only close resolved complaints");
        }

        complaint.setStatus(ComplaintStatus.CLOSED);
        Complaint saved = complaintRepository.save(complaint);

        return mapToResponse(saved);
    }

    /**
     * Lấy chi tiết phản hồi
     */
    public ComplaintResponse getComplaintById(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        return mapToResponse(complaint);
    }

    /**
     * Lấy danh sách phản hồi theo dealer
     */
    public List<ComplaintResponse> getComplaintsByDealer(Long dealerId) {
        List<Complaint> complaints = complaintRepository.findByDealerId(dealerId);
        return complaints.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Filter phản hồi theo nhiều tiêu chí
     * Hỗ trợ pagination và sorting
     */
    public Page<ComplaintResponse> filterComplaints(ComplaintFilterRequest filter) {
        log.info("Filtering complaints with criteria: {}", filter);

        // Build specification
        Specification<Complaint> spec = (root, query, cb) -> cb.conjunction();

        if (filter.getDealerId() != null) {
            spec = spec.and(ComplaintSpecification.hasDealerId(filter.getDealerId()));
        }
        if (filter.getStatus() != null) {
            spec = spec.and(ComplaintSpecification.hasStatus(filter.getStatus()));
        }
        if (filter.getComplaintType() != null) {
            spec = spec.and(ComplaintSpecification.hasType(filter.getComplaintType()));
        }
        if (filter.getSeverity() != null) {
            spec = spec.and(ComplaintSpecification.hasSeverity(filter.getSeverity()));
        }
        if (filter.getAssignedStaffId() != null) {
            spec = spec.and(ComplaintSpecification.hasAssignedStaff(filter.getAssignedStaffId()));
        }
        if (filter.getCustomerId() != null) {
            spec = spec.and(ComplaintSpecification.hasCustomerId(filter.getCustomerId()));
        }
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            spec = spec.and(ComplaintSpecification.createdBetween(filter.getStartDate(), filter.getEndDate()));
        }

        // Sorting
        Sort sort = Sort.by(
            filter.getSortDirection().equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC,
            filter.getSortBy()
        );

        // Pagination
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Complaint> page = complaintRepository.findAll(spec, pageable);

        return page.map(this::mapToResponse);
    }

    /**
     * Lấy thống kê phản hồi
     * Dealer Manager xem overview
     */
    public ComplaintStatisticsResponse getStatistics(Long dealerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting complaint statistics for dealer {}", dealerId);

        Long total = complaintRepository.countByDealerId(dealerId);

        // Count by status
        Long newCount = complaintRepository.countByDealerIdAndStatus(dealerId, ComplaintStatus.NEW);
        Long inProgressCount = complaintRepository.countByDealerIdAndStatus(dealerId, ComplaintStatus.IN_PROGRESS);
        Long resolvedCount = complaintRepository.countByDealerIdAndStatus(dealerId, ComplaintStatus.RESOLVED);
        Long closedCount = complaintRepository.countByDealerIdAndStatus(dealerId, ComplaintStatus.CLOSED);

        // Count by severity
        Long criticalCount = complaintRepository.countByDealerIdAndSeverity(dealerId, ComplaintSeverity.CRITICAL);
        Long highCount = complaintRepository.countByDealerIdAndSeverity(dealerId, ComplaintSeverity.HIGH);
        Long mediumCount = complaintRepository.countByDealerIdAndSeverity(dealerId, ComplaintSeverity.MEDIUM);
        Long lowCount = complaintRepository.countByDealerIdAndSeverity(dealerId, ComplaintSeverity.LOW);

        // Count by type
        Map<String, Long> byType = complaintRepository.countByComplaintType(dealerId).stream()
                .collect(Collectors.toMap(
                    obj -> obj[0].toString(),
                    obj -> ((Number) obj[1]).longValue()
                ));

        // Count by staff
        Map<String, Long> byStaff = complaintRepository.countByAssignedStaff(dealerId).stream()
                .collect(Collectors.toMap(
                    obj -> obj[0].toString(),
                    obj -> ((Number) obj[1]).longValue()
                ));

        // Average times
        Double avgResolutionTime = complaintRepository.getAverageResolutionTime(dealerId, ComplaintStatus.RESOLVED);
        Double avgFirstResponseTime = complaintRepository.getAverageFirstResponseTime(dealerId);

        // Overdue complaints (SLA)
        LocalDateTime criticalOverdueTime = LocalDateTime.now().minusHours(24);
        Long overdueCritical = complaintRepository.countOverdueComplaints(dealerId, ComplaintSeverity.CRITICAL, criticalOverdueTime);
        Long overdueHigh = complaintRepository.countOverdueComplaints(dealerId, ComplaintSeverity.HIGH, criticalOverdueTime);

        return ComplaintStatisticsResponse.builder()
                .totalComplaints(total)
                .newComplaints(newCount)
                .inProgressComplaints(inProgressCount)
                .resolvedComplaints(resolvedCount)
                .closedComplaints(closedCount)
                .criticalComplaints(criticalCount)
                .highComplaints(highCount)
                .mediumComplaints(mediumCount)
                .lowComplaints(lowCount)
                .complaintsByType(byType)
                .complaintsByStaff(byStaff)
                .averageResolutionTimeHours(avgResolutionTime != null ? avgResolutionTime : 0.0)
                .averageFirstResponseTimeHours(avgFirstResponseTime != null ? avgFirstResponseTime : 0.0)
                .overdueCritical(overdueCritical)
                .overdueHigh(overdueHigh)
                .build();
    }

    // ============ Helper Methods ============

    private String generateComplaintCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "FB-" + date + "-" + random;
    }

    private List<ComplaintResponse.ProgressUpdateInfo> parseProgressUpdates(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<ComplaintResponse.ProgressUpdateInfo>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing progress updates", e);
            return new ArrayList<>();
        }
    }

    private String serializeProgressUpdates(List<ComplaintResponse.ProgressUpdateInfo> updates) {
        try {
            return objectMapper.writeValueAsString(updates);
        } catch (JsonProcessingException e) {
            log.error("Error serializing progress updates", e);
            return "[]";
        }
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .complaintId(complaint.getComplaintId())
                .complaintCode(complaint.getComplaintCode())
                .customerId(complaint.getCustomer().getCustomerId())
                .customerName(complaint.getCustomerName())
                .customerPhone(complaint.getCustomerPhone())
                .customerEmail(complaint.getCustomerEmail())
                .dealerId(complaint.getDealerId())
                .orderId(complaint.getOrderId())
                .complaintType(complaint.getComplaintType())
                .complaintTypeDisplay(complaint.getComplaintType().getDisplayName())
                .severity(complaint.getSeverity())
                .severityDisplay(complaint.getSeverity().getDisplayName())
                .channel(complaint.getChannel())
                .channelDisplay(complaint.getChannel() != null ? complaint.getChannel().getDisplayName() : null)
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .statusDisplay(complaint.getStatus().getDisplayName())
                .assignedStaffId(complaint.getAssignedStaffId())
                .assignedStaffName(complaint.getAssignedStaffName())
                .internalNotes(complaint.getInternalNotes())
                .progressHistory(parseProgressUpdates(complaint.getProgressUpdates()))
                .resolution(complaint.getResolution())
                .resolvedDate(complaint.getResolvedDate())
                .firstResponseAt(complaint.getFirstResponseAt())
                .notificationSent(complaint.getNotificationSent())
                .notificationSentAt(complaint.getNotificationSentAt())
                .createdByStaffId(complaint.getCreatedByStaffId())
                .createdByStaffName(complaint.getCreatedByStaffName())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    private void sendNotificationToStaff(Complaint complaint, String message) {
        try {
            NotificationRequest notification = NotificationRequest.builder()
                    .recipientName(complaint.getAssignedStaffName())
                    .subject("Phân công xử lý phản hồi")
                    .message(message)
                    .notificationType("EMAIL")
                    .build();

            // TODO: Send notification via Kafka when configured
            // kafkaTemplate.send("notification-topic", notification);
            log.info("TODO: Send notification to staff {} - {}", complaint.getAssignedStaffId(), message);
        } catch (Exception e) {
            log.error("Error sending notification to staff", e);
        }
    }

    private void sendResolutionNotificationToCustomer(Complaint complaint) {
        try {
            String emailBody = String.format("""
                Kính gửi %s,
                
                Phản hồi của bạn (Mã: %s) đã được xử lý xong.
                
                Kết quả xử lý:
                %s
                
                Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi.
                
                Trân trọng,
                %s
                """,
                complaint.getCustomerName(),
                complaint.getComplaintCode(),
                complaint.getResolution(),
                complaint.getAssignedStaffName()
            );

            NotificationRequest notification = NotificationRequest.builder()
                    .recipientEmail(complaint.getCustomerEmail())
                    .recipientPhone(complaint.getCustomerPhone())
                    .recipientName(complaint.getCustomerName())
                    .subject("Kết quả xử lý phản hồi")
                    .message(emailBody)
                    .notificationType("EMAIL")
                    .build();

            // TODO: Send notification via Kafka when configured
            // kafkaTemplate.send("notification-topic", notification);

            // Update notification sent flag
            complaint.setNotificationSent(true);
            complaint.setNotificationSentAt(LocalDateTime.now());
            complaintRepository.save(complaint);

            log.info("TODO: Send resolution notification to customer {}", complaint.getCustomerEmail());
        } catch (Exception e) {
            log.error("Error sending resolution notification", e);
        }
    }
}

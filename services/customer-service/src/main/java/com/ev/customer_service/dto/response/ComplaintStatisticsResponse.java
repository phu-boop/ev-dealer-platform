package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO cho thống kê phản hồi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintStatisticsResponse {

    private Long totalComplaints;

    // Thống kê theo trạng thái
    private Long newComplaints;
    private Long inProgressComplaints;
    private Long resolvedComplaints;
    private Long closedComplaints;

    // Thống kê theo mức độ nghiêm trọng
    private Long criticalComplaints;
    private Long highComplaints;
    private Long mediumComplaints;
    private Long lowComplaints;

    // Thống kê theo loại
    private Map<String, Long> complaintsByType; // {"VEHICLE_QUALITY": 10, "SERVICE_ATTITUDE": 5}

    // Thống kê theo nhân viên xử lý
    private Map<String, Long> complaintsByStaff; // {"Staff Name": count}

    // Thời gian xử lý
    private Double averageResolutionTimeHours;
    private Double averageFirstResponseTimeHours;

    // SLA metrics
    private Long overdueCritical; // Critical chưa xử lý quá 24h
    private Long overdueHigh; // High chưa xử lý quá 24h
}

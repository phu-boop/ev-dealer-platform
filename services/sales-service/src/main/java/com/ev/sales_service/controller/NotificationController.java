package com.ev.sales_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.response.NotificationDto;
import com.ev.sales_service.entity.Notification; 
import com.ev.sales_service.entity.OrderTracking;
import com.ev.sales_service.enums.NotificationAudience;
import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.enums.SaleOderType;
import com.ev.sales_service.repository.SalesOrderRepositoryB2B; 
import com.ev.sales_service.entity.SalesOrder; 
import com.ev.sales_service.mapper.NotificationMapper; // (Cần tạo file mapper này)
import com.ev.sales_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import java.util.List; 
import java.util.stream.Stream; 
import java.util.stream.Collectors; 
import java.time.LocalDateTime; 

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')") // Bảo vệ toàn bộ controller
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper; // Tiêm mapper
    private final SalesOrderRepositoryB2B salesOrderRepositoryB2B;

    // API lấy danh sách thông báo (đã lưu CSDL)
    @GetMapping("/staff")
    public ResponseEntity<ApiRespond<Page<NotificationDto>>> getStaffNotifications(
            @PageableDefault(size = 10) Pageable pageable) {

        // BƯỚC 1: Lấy các thông báo "TÁC VỤ" (PENDING, DISPUTED)
        List<SalesOrder> pendingOrders = salesOrderRepositoryB2B.findAllByTypeOderAndOrderStatus(
            SaleOderType.B2B, OrderStatusB2B.PENDING
        );
        List<SalesOrder> disputedOrders = salesOrderRepositoryB2B.findAllByTypeOderAndOrderStatus(
            SaleOderType.B2B, OrderStatusB2B.DISPUTED
        );

        Stream<NotificationDto> pendingDtos = pendingOrders.stream()
            .map(this::convertPendingOrderToNotificationDto);
        Stream<NotificationDto> disputedDtos = disputedOrders.stream()
            .map(this::convertDisputedOrderToNotificationDto);
        
        // SỬA 2: Đổi tên hàm để lấy List thay vì Page
        List<String> taskTypesToExclude = List.of("ORDER_PLACED", "ORDER_DISPUTED");
        
        List<NotificationDto> otherNotifications = notificationRepository
            .findAllByAudienceAndTypeNotInOrderByCreatedAtDesc(NotificationAudience.STAFF, taskTypesToExclude) 
            .stream()
            .map(notificationMapper::toDto)
            .collect(Collectors.toList());

        // BƯỚC 3: Gộp tất cả lại
        List<NotificationDto> allDtos = Stream.concat(
            Stream.concat(pendingDtos, disputedDtos),
            otherNotifications.stream()
        )
        .sorted((n1, n2) -> {
            // SỬA LẠI LOGIC SẮP XẾP ĐỂ DÙNG 'unread'
            if (n1.isUnread() && !n2.isUnread()) return -1;
            if (!n1.isUnread() && n2.isUnread()) return 1;
            
            // Sắp xếp theo createdAt (vẫn tồn tại trong DTO)
            if (n1.getCreatedAt() == null || n2.getCreatedAt() == null) return 0;
            return n2.getCreatedAt().compareTo(n1.getCreatedAt());
        })
        .collect(Collectors.toList());

        // BƯỚC 4: Áp dụng phân trang thủ công
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allDtos.size());
        
        Page<NotificationDto> dtoPage = new PageImpl<>(
            allDtos.subList(start, end), 
            pageable, 
            allDtos.size()
        );

        return ResponseEntity.ok(ApiRespond.success("Lấy thông báo thành công", dtoPage));
    }

    // API đếm số thông báo chưa đọc
    @GetMapping("/staff/unread-count")
    public ResponseEntity<ApiRespond<Map<String, Long>>> getUnreadCount() {
        long count = notificationRepository.countByAudienceAndIsReadFalse(NotificationAudience.STAFF);
        return ResponseEntity.ok(ApiRespond.success("OK", Map.of("unreadCount", count)));
    }


    // API đánh dấu 1 thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiRespond<NotificationDto>> markAsRead(@PathVariable UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // (Kiểm tra xem user có quyền đọc noti này không nếu cần)
        
        notification.setRead(true);
        Notification savedNotification = notificationRepository.save(notification);

        return ResponseEntity.ok(ApiRespond.success("Đã đánh dấu đã đọc", notificationMapper.toDto(savedNotification)));
    }

    // API đánh dấu TẤT CẢ thông báo là đã đọc
    @PutMapping("/staff/read-all")
    public ResponseEntity<ApiRespond<String>> markAllAsRead() {
        int updatedCount = notificationRepository.markAllAsReadByAudience(NotificationAudience.STAFF);
        
        // Tách riêng message và data
        String message = "Đánh dấu tất cả đã đọc thành công";
        String data = "Đã cập nhật " + updatedCount + " thông báo";

        // FIX: Truyền vào 2 tham số (message, data)
        return ResponseEntity.ok(ApiRespond.success(message, data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @Transactional
    public ResponseEntity<ApiRespond<String>> deleteNotification(@PathVariable UUID id) {
        // 1. Tìm thông báo
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // 2. Kiểm tra quyền (chỉ cho phép xóa thông báo của STAFF)
        if (notification.getAudience() != NotificationAudience.STAFF) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 3. LOGIC MỚI: KIỂM TRA NẾU LÀ KHIẾU NẠI
        if ("ORDER_DISPUTED".equals(notification.getType())) {
            // Cố gắng lấy Order ID từ link (ví dụ: /evm/b2b-orders/...)
            UUID orderId = extractOrderIdFromLink(notification.getLink());
            
            if (orderId != null) {
                // Tìm đơn hàng tương ứng
                Optional<SalesOrder> orderOpt = salesOrderRepositoryB2B.findById(orderId);
                if (orderOpt.isPresent()) {
                    SalesOrder order = orderOpt.get();
                    
                    // 4. CHẶN XÓA NẾU ĐƠN HÀNG VẪN ĐANG BỊ KHIẾU NẠI
                    if (OrderStatusB2B.DISPUTED.equals(order.getOrderStatus())) {
                        throw new AppException(ErrorCode.BAD_REQUEST);
                    }
                }
            }
        }

        // 5. Nếu vượt qua các kiểm tra, tiến hành xóa
        notificationRepository.delete(notification);
        return ResponseEntity.ok(ApiRespond.success("Đã xóa thông báo", id.toString()));
    }

    /**
     * Hàm helper để trích xuất UUID từ chuỗi link
     */
    private UUID extractOrderIdFromLink(String link) {
        if (link == null || link.isEmpty()) {
            return null;
        }
        try {
            String uuidString = link.substring(link.lastIndexOf('/') + 1);
            return UUID.fromString(uuidString);
        } catch (Exception e) {
            // (Ghi log lỗi nếu cần)
            return null;
        }
    }
    
    private NotificationDto convertPendingOrderToNotificationDto(SalesOrder order) {
        return NotificationDto.builder()
            .id(order.getOrderId().toString())
            .type("ORDER_PLACED")
            .message("Đơn hàng B2B mới từ Đại lý. Mã ĐH: " + order.getOrderId().toString().substring(0, 8))
            .link("/evm/b2b-orders/" + order.getOrderId().toString())
            .unread(true) // Tác vụ luôn là chưa đọc
            .audience(NotificationAudience.STAFF)
            .createdAt(order.getOrderDate()) // <-- Dùng cho sắp xếp
            .time(notificationMapper.toRelativeTime(order.getOrderDate())) // <-- Dùng cho hiển thị
            .build();
    }
    
    private NotificationDto convertDisputedOrderToNotificationDto(SalesOrder order) {
        String reason = order.getOrderTrackings().stream()
            .filter(t -> "ĐÃ BÁO CÁO SỰ CỐ".equals(t.getStatus()))
            .map(OrderTracking::getNotes)
            .findFirst()
            .orElse("Không rõ lý do");

        LocalDateTime disputedAt = order.getOrderTrackings().stream() // Lấy thời gian khiếu nại
            .filter(t -> "ĐÃ BÁO CÁO SỰ CỐ".equals(t.getStatus()))
            .map(OrderTracking::getUpdateDate)
            .findFirst()
            .orElse(order.getOrderDate())
        ;

        return NotificationDto.builder()
            .id(order.getOrderId().toString())
            .type("ORDER_DISPUTED")
            .message("Khiếu nại đơn hàng. Mã ĐH: " + order.getOrderId().toString().substring(0, 8) + ". Lý do: " + reason)
            .link("/evm/b2b-orders/" + order.getOrderId().toString())
            .unread(true) // Tác vụ luôn là chưa đọc
            .audience(NotificationAudience.STAFF)
            .createdAt(disputedAt) // <-- Dùng cho sắp xếp
            .time(notificationMapper.toRelativeTime(disputedAt)) // <-- Dùng cho hiển thị
            .build();
    }
}

package com.ev.user_service.controller;

import com.ev.user_service.dto.internal.PromotionDTO;
import com.ev.user_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/promotions")
    public void handleNewPromotion(@RequestBody PromotionDTO dto) {
        notificationService.sendPromotionNotificationToAdmins(dto);
    }
}

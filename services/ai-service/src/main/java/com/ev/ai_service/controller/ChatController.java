package com.ev.ai_service.controller;

import com.ev.ai_service.dto.ChatRequest;
import com.ev.ai_service.dto.ChatResponse;
import com.ev.ai_service.service.ChatService;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    /**
     * Chat endpoint for customer consultation
     * POST /ai/api/chat
     */
    @PostMapping
    public ResponseEntity<ApiRespond<ChatResponse>> chat(
            @RequestBody ChatRequest request) {
        log.info("Chat request received - Message: {}, Context: {}", 
                request.getMessage(), request.getContext());

        try {
            ChatResponse response = chatService.processMessage(request);
            return ResponseEntity.ok(
                    ApiRespond.success("Chat response generated successfully", response));
        } catch (Exception e) {
            log.error("Error processing chat message: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", "Failed to process chat message: " + e.getMessage(), null));
        }
    }
}

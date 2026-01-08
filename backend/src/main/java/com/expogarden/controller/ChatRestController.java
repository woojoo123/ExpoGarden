package com.expogarden.controller;

import com.expogarden.dto.ChatMessageDto;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;

    @GetMapping("/booths/{boothId}/chat/messages")
    @PreAuthorize("@boothSecurityService.canAccessBooth(#boothId, principal)")
    public ResponseEntity<?> getChatMessages(
        @PathVariable Long boothId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ChatMessageDto> messages = chatService.getMessages(boothId, pageable);

        return ResponseEntity.ok(Map.of("data", Map.of(
            "content", messages.getContent(),
            "totalElements", messages.getTotalElements(),
            "totalPages", messages.getTotalPages(),
            "size", messages.getSize(),
            "number", messages.getNumber()
        )));
    }
}

package com.expogarden.controller;

import com.expogarden.dto.ChatMessageDto;
import com.expogarden.dto.ChatNotificationDto;
import com.expogarden.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    
    // 부스별 채팅 메시지 전송
    @MessageMapping("/chat.booth.{boothId}")
    @SendTo("/topic/booth.{boothId}")
    public ChatMessageDto sendMessage(
        @DestinationVariable Long boothId,
        @Payload ChatMessageDto message,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        ChatMessageDto savedMessage = chatService.createChatMessage(boothId, message);

        log.info("Chat message in booth {}: {} - {}", boothId, savedMessage.getUsername(), savedMessage.getMessage());

        Long ownerUserId = chatService.getBoothOwnerId(boothId);
        ChatNotificationDto notification = ChatNotificationDto.builder()
            .boothId(boothId)
            .messageId(savedMessage.getId())
            .username(savedMessage.getUsername())
            .messagePreview(savedMessage.getMessage())
            .timestamp(savedMessage.getTimestamp())
            .build();
        messagingTemplate.convertAndSend("/topic/owner." + ownerUserId, notification);

        return savedMessage;
    }
    
    // 사용자 입장
    @MessageMapping("/chat.join.{boothId}")
    @SendTo("/topic/booth.{boothId}")
    public ChatMessageDto addUser(
        @DestinationVariable Long boothId,
        @Payload ChatMessageDto message,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        // 세션에 사용자 정보 저장
        headerAccessor.getSessionAttributes().put("username", message.getUsername());
        headerAccessor.getSessionAttributes().put("boothId", boothId);
        
        message.setId(UUID.randomUUID().toString());
        message.setBoothId(boothId);
        message.setType(ChatMessageDto.MessageType.JOIN);
        message.setTimestamp(Instant.now());
        message.setMessage(message.getUsername() + "님이 입장하셨습니다.");
        
        log.info("User {} joined booth {}", message.getUsername(), boothId);
        
        return message;
    }
}

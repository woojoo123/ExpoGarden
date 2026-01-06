package com.expogarden.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String id;
    private Long boothId;
    private Long userId;
    private String username;
    private String message;
    private Instant timestamp;
    private MessageType type;
    
    public enum MessageType {
        CHAT,    // 일반 채팅
        JOIN,    // 입장
        LEAVE    // 퇴장
    }
}


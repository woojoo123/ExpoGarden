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
public class HallChatMessageDto {
    private Long hallId;
    private Long userId;
    private String nickname;
    private String message;
    private Instant timestamp;
    private MessageType type;
    
    public enum MessageType {
        CHAT
    }
}

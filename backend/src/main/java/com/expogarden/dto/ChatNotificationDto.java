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
public class ChatNotificationDto {
    private Long boothId;
    private String messageId;
    private String username;
    private String messagePreview;
    private Instant timestamp;
}

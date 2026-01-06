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
public class QuestionDto {
    private Long id;
    private Long boothId;
    private Long userId;
    private String userNickname;
    private String guestSessionId;
    private String content;
    private String status;
    private Instant createdAt;
}


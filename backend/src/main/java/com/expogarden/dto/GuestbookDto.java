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
public class GuestbookDto {
    private Long id;
    private Long boothId;
    private Long exhibitionId;
    private Long userId;
    private String userNickname;
    private String guestSessionId;
    private String message;
    private String status;
    private Instant createdAt;
}


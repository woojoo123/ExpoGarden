package com.expogarden.dto;

import com.expogarden.domain.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoothMemberDto {
    private Long id;
    private Long boothId;
    private Long userId;
    private String userNickname;
    private String userEmail;
    private MemberRole role;
    private Instant createdAt;
}


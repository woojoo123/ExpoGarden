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
public class PlayerPositionDto {
    private Long userId;
    private String nickname;
    private Double x;
    private Double y;
    private Integer charIndex;
    private Long hallId;
    private Instant timestamp;
    private PositionType type;
    
    public enum PositionType {
        JOIN,    // 입장
        LEAVE,   // 퇴장
        UPDATE   // 위치 업데이트
    }
}


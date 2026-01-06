package com.expogarden.dto;

import com.expogarden.domain.LayoutType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HallDto {
    private Long id;
    private Long exhibitionId;
    private String name;
    private LayoutType layoutType;
    private Map<String, Object> layoutConfig;
    private Long boothCount;
    private Instant createdAt;
    private Instant updatedAt;
}


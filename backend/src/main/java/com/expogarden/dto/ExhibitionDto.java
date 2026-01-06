package com.expogarden.dto;

import com.expogarden.domain.ExhibitionStatus;
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
public class ExhibitionDto {
    private Long id;
    private String slug;
    private String title;
    private String description;
    private ExhibitionStatus status;
    private Instant startAt;
    private Instant endAt;
    private Map<String, Object> settings;
    private Long hallCount;
    private Long boothCount;
    private Instant createdAt;
    private Instant updatedAt;
}


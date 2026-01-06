package com.expogarden.dto;

import com.expogarden.domain.BoothStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoothDto {
    private Long id;
    private Long exhibitionId;
    private Long hallId;
    private Long ownerUserId;
    private String ownerNickname;
    private BoothStatus status;
    private String title;
    private String summary;
    private String description;
    private String category;
    private String thumbnailUrl;
    private List<String> tags;
    private Boolean allowGuestQuestions;
    private Boolean allowGuestGuestbook;
    private List<BoothMediaDto> media;
    private Map<String, Object> posOverride;
    private Instant approvedAt;
    private Instant createdAt;
    private Instant updatedAt;
}


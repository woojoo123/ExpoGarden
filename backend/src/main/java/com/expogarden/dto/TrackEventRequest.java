package com.expogarden.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class TrackEventRequest {
    @NotNull
    private Long exhibitionId;
    
    private Long boothId;
    
    @NotBlank
    private String sessionId;
    
    @NotBlank
    private String action;
    
    private Map<String, Object> metadata;
}


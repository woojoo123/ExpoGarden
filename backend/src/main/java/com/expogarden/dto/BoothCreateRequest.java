package com.expogarden.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class BoothCreateRequest {
    @NotNull
    private Long exhibitionId;
    
    @NotNull
    private Long hallId;
    
    @NotBlank
    @Size(max = 255)
    private String title;
    
    @Size(max = 500)
    private String summary;
    
    private String description;
    
    @Size(max = 100)
    private String category;
    
    @Size(max = 500)
    private String thumbnailUrl;
    
    private List<String> tags;
    
    private Boolean allowGuestQuestions = false;
    
    private Boolean allowGuestGuestbook = false;
    
    private List<BoothMediaDto> media;
    
    private Map<String, Object> posOverride;
}


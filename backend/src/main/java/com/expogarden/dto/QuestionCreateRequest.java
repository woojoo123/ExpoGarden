package com.expogarden.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuestionCreateRequest {
    @NotBlank
    private String content;
    
    private String guestSessionId;
}


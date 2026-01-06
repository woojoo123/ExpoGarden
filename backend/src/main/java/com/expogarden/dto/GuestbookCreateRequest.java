package com.expogarden.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuestbookCreateRequest {
    @NotBlank
    private String message;
    
    private String guestSessionId;
}


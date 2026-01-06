package com.expogarden.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectRequest {
    @NotBlank
    private String reason;
}


package com.expogarden.dto;

import com.expogarden.domain.MemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BoothMemberRequest {
    @NotNull
    private Long userId;
    
    @NotNull
    private MemberRole role;
}


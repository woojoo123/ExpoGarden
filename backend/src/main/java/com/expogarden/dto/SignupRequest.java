package com.expogarden.dto;

import com.expogarden.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Email
    @Size(max = 255)
    private String email;
    
    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
    
    @NotBlank
    @Size(max = 100)
    private String nickname;
    
    // role은 선택사항 (기본값: EXHIBITOR)
    private Role role;
}


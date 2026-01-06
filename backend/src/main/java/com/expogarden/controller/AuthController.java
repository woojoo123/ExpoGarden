package com.expogarden.controller;

import com.expogarden.dto.*;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        UserDto user = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", user));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(Map.of("data", response));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refresh(request);
        return ResponseEntity.ok(Map.of("data", response));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody RefreshTokenRequest request) {
        // 실제로는 Redis 등에서 토큰 블랙리스트 처리 필요
        // 현재는 클라이언트에서 토큰을 삭제하는 것으로 충분
        return ResponseEntity.ok(Map.of("data", Map.of("message", "로그아웃 되었습니다")));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto user = UserDto.builder()
            .id(userPrincipal.getId())
            .email(userPrincipal.getEmail())
            .nickname(userPrincipal.getNickname())
            .role(userPrincipal.getRole())
            .build();
        
        return ResponseEntity.ok(Map.of("data", user));
    }
}


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
    // ResponseEntity<?>는 Spring Framework에서 HTTP 응답의 본문(body), 상태 코드(status code), 그리고 헤더(headers)를 모두 포함해 반환할 수 있도록 도와주는 클래스입니다.
    // 여기서 ?는 반환 데이터 타입을 제네릭으로 지정하지 않고, 어떤 타입이든 올 수 있다는 의미(my be UserDto, Map 등 임의 타입).
    // 즉, 다양한 형태의 응답 데이터를 유연하게 반환할 수 있습니다.

    // @Valid는 Java Bean Validation(JSR-380)에서 사용하는 어노테이션으로, 컨트롤러의 메서드 파라미터에 붙이면 해당 객체(SignupRequest)에 대한 유효성(validation) 검사를 수행합니다.
    // 예를 들어 SignupRequest 클래스에 @NotBlank, @Email, @Size 등과 같이 다양한 유효성 제약 조건을 지정해두면,
    // @Valid 어노테이션 덕분에 request 객체가 컨트롤러에 전달될 때 자동으로 검증되고, 조건을 만족하지 않으면 컨트롤러 진입 전에 400 Bad Request와 함께 에러 메시지가 반환됩니다.
    // 즉, 클라이언트에서 잘못된 데이터가 넘어왔을 때(예: 이메일 형식 아님, 필수값 누락 등) 서버가 안전하게 방어할 수 있게 도와주는 역할입니다.
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


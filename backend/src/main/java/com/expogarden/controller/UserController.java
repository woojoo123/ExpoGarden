package com.expogarden.controller;

import com.expogarden.dto.UserDto;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @PostMapping("/character")
    public ResponseEntity<?> selectCharacter(
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        @RequestBody Map<String, String> request
    ) {
        if (userPrincipal == null) {
            log.error("UserPrincipal is null");
            return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
        }
        
        String characterId = request.get("characterId");
        
        if (characterId == null || characterId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "캐릭터 ID를 입력해주세요."));
        }
        
        try {
            UserDto user = userService.selectCharacter(userPrincipal.getId(), characterId);
            return ResponseEntity.ok(Map.of("data", user));
        } catch (RuntimeException e) {
            log.error("Error selecting character for user {}: {}", userPrincipal.getId(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "캐릭터 선택에 실패했습니다: " + e.getMessage()));
        }
    }
}


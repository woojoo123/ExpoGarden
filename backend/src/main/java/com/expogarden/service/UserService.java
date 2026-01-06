package com.expogarden.service;

import com.expogarden.domain.User;
import com.expogarden.dto.UserDto;
import com.expogarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    @Transactional
    public UserDto selectCharacter(Long userId, String characterId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 유효한 캐릭터 ID인지 확인
        if (!isValidCharacterId(characterId)) {
            throw new RuntimeException("Invalid character ID");
        }
        
        user.setSelectedCharacter(characterId);
        User savedUser = userRepository.save(user);
        
        return mapToDto(savedUser);
    }
    
    private boolean isValidCharacterId(String characterId) {
        // 파츠 레이어 시스템: JSON 문자열 허용 (최대 500자)
        return characterId != null && !characterId.isEmpty() && characterId.length() <= 500;
    }
    
    private UserDto mapToDto(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .role(user.getRole())
            .selectedCharacter(user.getSelectedCharacter())
            .createdAt(user.getCreatedAt())
            .build();
    }
}


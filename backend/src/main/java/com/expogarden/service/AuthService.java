package com.expogarden.service;

import com.expogarden.domain.Role;
import com.expogarden.domain.User;
import com.expogarden.dto.*;
import com.expogarden.repository.UserRepository;
import com.expogarden.security.JwtTokenProvider;
import com.expogarden.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    
    @Transactional
    public UserDto signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .nickname(request.getNickname())
            .role(request.getRole())
            .build();
        
        user = userRepository.save(user);
        
        return mapToDto(user);
    }
    
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);
        
        return TokenResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(900L) // 15분 in seconds
            .tokenType("Bearer")
            .user(UserDto.builder()
                .id(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .nickname(userPrincipal.getNickname())
                .role(userPrincipal.getRole())
                .build())
            .build();
    }
    
    public TokenResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        String tokenType = tokenProvider.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new RuntimeException("Not a refresh token");
        }
        
        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserPrincipal userPrincipal = new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getRole(),
            user.getNickname()
        );
        
        String newAccessToken = tokenProvider.generateAccessToken(userPrincipal);
        
        return TokenResponse.builder()
            .accessToken(newAccessToken)
            .expiresIn(900L)
            .tokenType("Bearer")
            .build();
    }
    
    private UserDto mapToDto(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .role(user.getRole())
            .createdAt(user.getCreatedAt())
            .build();
    }
}


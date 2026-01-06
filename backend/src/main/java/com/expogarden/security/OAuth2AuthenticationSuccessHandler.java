package com.expogarden.security;

import com.expogarden.domain.Role;
import com.expogarden.domain.User;
import com.expogarden.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    
    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        
        // 구글에서 받은 사용자 정보
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        log.info("OAuth2 login successful - Email: {}, Name: {}", email, name);
        
        // 사용자 조회 또는 생성
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User newUser = User.builder()
                    .email(email)
                    .nickname(name != null ? name : email.split("@")[0])
                    .role(Role.VISITOR) // 기본 역할
                    .passwordHash(null) // OAuth 전용 계정은 비밀번호 없음
                    .build();
                
                return userRepository.save(newUser);
            });
        
        // UserPrincipal 생성
        UserPrincipal userPrincipal = new UserPrincipal(
            user.getId(),
            user.getEmail(),
            null, // OAuth는 비밀번호 없음
            user.getRole(),
            user.getNickname(),
            user.getSelectedCharacter()
        );
        
        // JWT 토큰 발급
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);
        
        // 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth/callback")
            .queryParam("accessToken", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}


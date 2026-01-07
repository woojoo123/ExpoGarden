package com.expogarden.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            String requestPath = request.getRequestURI();
            String requestMethod = request.getMethod();
            
            log.debug("JWT Filter - {} {} | Has JWT: {}", requestMethod, requestPath, StringUtils.hasText(jwt));
            
            if (StringUtils.hasText(jwt)) {
                boolean isValid = tokenProvider.validateToken(jwt);
                log.debug("JWT Filter - Token valid: {}", isValid);
                
                if (isValid) {
                    String tokenType = tokenProvider.getTokenType(jwt);
                    log.debug("JWT Filter - Token type: {}", tokenType);
                    
                    // Access 토큰만 인증에 사용
                    if ("access".equals(tokenType)) {
                        Long userId = tokenProvider.getUserIdFromToken(jwt);
                        log.debug("JWT Filter - User ID: {}", userId);
                        
                        UserDetails userDetails = customUserDetailsService.loadUserById(userId);
                        log.debug("JWT Filter - User: {} | Authorities: {}", userDetails.getUsername(), userDetails.getAuthorities());
                        
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                            );
                        
                        authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("JWT Filter - Authentication set in SecurityContext");
                    } else {
                        log.warn("JWT Filter - Token type is not 'access': {}", tokenType);
                    }
                } else {
                    log.warn("JWT Filter - Token validation failed for {} {}", requestMethod, requestPath);
                }
            } else {
                log.debug("JWT Filter - No JWT token in request");
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}


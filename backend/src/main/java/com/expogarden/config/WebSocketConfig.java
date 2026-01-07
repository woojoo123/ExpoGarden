package com.expogarden.config;

import com.expogarden.service.PlayerPositionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    private final PlayerPositionService playerPositionService;
    private final SimpMessagingTemplate messagingTemplate;
    
    public WebSocketConfig(PlayerPositionService playerPositionService, @Lazy SimpMessagingTemplate messagingTemplate) {
        this.playerPositionService = playerPositionService;
        this.messagingTemplate = messagingTemplate;
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 구독할 prefix
        config.enableSimpleBroker("/topic", "/queue");
        // 클라이언트가 메시지를 보낼 prefix
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
    
    /**
     * WebSocket 세션 종료 이벤트 리스너
     * 페이지 새로고침, 탭 닫기 등으로 연결이 끊어질 때 자동 호출됨
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        log.info("WebSocket session disconnected: {}", sessionId);
        
        // 모든 홀에서 해당 세션 제거 및 LEAVE 메시지 브로드캐스트
        playerPositionService.removePlayerBySessionId(sessionId, messagingTemplate);
    }
}


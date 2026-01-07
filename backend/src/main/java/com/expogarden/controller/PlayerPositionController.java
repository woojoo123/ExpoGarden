package com.expogarden.controller;

import com.expogarden.dto.PlayerPositionDto;
import com.expogarden.service.PlayerPositionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PlayerPositionController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final PlayerPositionService playerPositionService;
    
    // 플레이어 위치 업데이트
    @MessageMapping("/player.position.{hallId}")
    @SendTo("/topic/hall.{hallId}")
    public PlayerPositionDto updatePosition(
        @DestinationVariable Long hallId,
        @Payload PlayerPositionDto position,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        String sessionId = headerAccessor.getSessionId();
        position.setHallId(hallId);
        position.setTimestamp(Instant.now());
        position.setType(PlayerPositionDto.PositionType.UPDATE);
        
        // 세션 관리
        playerPositionService.updatePlayerPosition(hallId, sessionId, position);
        
        log.info("Player position update in hall {}: userId={}, nickname={}, x={}, y={}", 
            hallId, position.getUserId(), position.getNickname(), position.getX(), position.getY());
        
        return position;
    }
    
    // 플레이어 입장
    @MessageMapping("/player.join.{hallId}")
    @SendTo("/topic/hall.{hallId}")
    public PlayerPositionDto joinHall(
        @DestinationVariable Long hallId,
        @Payload PlayerPositionDto position,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        String sessionId = headerAccessor.getSessionId();
        position.setHallId(hallId);
        position.setTimestamp(Instant.now());
        position.setType(PlayerPositionDto.PositionType.JOIN);
        
        // 세션에 플레이어 정보 저장
        headerAccessor.getSessionAttributes().put("userId", position.getUserId());
        headerAccessor.getSessionAttributes().put("hallId", hallId);
        headerAccessor.getSessionAttributes().put("nickname", position.getNickname());
        
        // 플레이어 입장 처리 및 기존 플레이어 목록 전송
        playerPositionService.addPlayer(hallId, sessionId, position);
        
        // 기존 플레이어 목록을 새 플레이어에게 전송
        playerPositionService.sendExistingPlayers(hallId, sessionId, messagingTemplate);
        
        log.info("Player {} joined hall {} (sessionId: {}, userId: {})", 
            position.getNickname(), hallId, sessionId, position.getUserId());
        
        // JOIN 메시지를 브로드캐스트 (다른 플레이어들이 새 플레이어를 볼 수 있도록)
        log.info("Broadcasting JOIN message to /topic/hall.{} for player {}", hallId, position.getNickname());
        
        return position;
    }
    
    // 플레이어 퇴장
    @MessageMapping("/player.leave.{hallId}")
    @SendTo("/topic/hall.{hallId}")
    public PlayerPositionDto leaveHall(
        @DestinationVariable Long hallId,
        @Payload PlayerPositionDto position,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        String sessionId = headerAccessor.getSessionId();
        position.setHallId(hallId);
        position.setTimestamp(Instant.now());
        position.setType(PlayerPositionDto.PositionType.LEAVE);
        
        // 플레이어 제거
        playerPositionService.removePlayer(hallId, sessionId);
        
        log.info("Player {} left hall {} (sessionId: {})", position.getNickname(), hallId, sessionId);
        
        return position;
    }
}


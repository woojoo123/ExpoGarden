package com.expogarden.service;

import com.expogarden.dto.PlayerPositionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerPositionService {
    
    // 홀별 활성 플레이어 세션 관리: Map<hallId, Map<sessionId, PlayerPositionDto>>
    private final Map<Long, Map<String, PlayerPositionDto>> hallPlayers = new ConcurrentHashMap<>();
    
    /**
     * 플레이어를 홀에 추가
     */
    public void addPlayer(Long hallId, String sessionId, PlayerPositionDto position) {
        hallPlayers.computeIfAbsent(hallId, k -> new ConcurrentHashMap<>()).put(sessionId, position);
        log.info("Added player to hall {}: sessionId={}, userId={}, nickname={}, total={}", 
            hallId, sessionId, position.getUserId(), position.getNickname(), hallPlayers.get(hallId).size());
    }
    
    /**
     * 플레이어 위치 업데이트
     */
    public void updatePlayerPosition(Long hallId, String sessionId, PlayerPositionDto position) {
        Map<String, PlayerPositionDto> players = hallPlayers.get(hallId);
        if (players != null && players.containsKey(sessionId)) {
            players.put(sessionId, position);
        } else {
            // 세션이 없으면 자동으로 추가 (JOIN 전에 위치 업데이트가 올 수 있음)
            log.warn("Updating position for unknown session in hall {}: sessionId={}, userId={}. Adding to hall.", 
                hallId, sessionId, position.getUserId());
            addPlayer(hallId, sessionId, position);
        }
    }
    
    /**
     * 플레이어 제거
     */
    public void removePlayer(Long hallId, String sessionId) {
        Map<String, PlayerPositionDto> players = hallPlayers.get(hallId);
        if (players != null) {
            players.remove(sessionId);
            if (players.isEmpty()) {
                hallPlayers.remove(hallId);
            }
            log.debug("Removed player from hall {}: sessionId={}, remaining={}", 
                hallId, sessionId, players.size());
        }
    }
    
    /**
     * 기존 플레이어 목록을 새 플레이어에게 전송
     */
    public void sendExistingPlayers(Long hallId, String newSessionId, SimpMessagingTemplate messagingTemplate) {
        Map<String, PlayerPositionDto> players = hallPlayers.get(hallId);
        if (players == null || players.isEmpty()) {
            log.info("No existing players in hall {} for new session {}", hallId, newSessionId);
            return;
        }
        
        log.info("Sending existing players to new session. Hall: {}, NewSession: {}, TotalPlayers: {}", 
            hallId, newSessionId, players.size());
        
        // 새 플레이어를 제외한 기존 플레이어 목록
        List<PlayerPositionDto> existingPlayers = new ArrayList<>();
        for (Map.Entry<String, PlayerPositionDto> entry : players.entrySet()) {
            if (!entry.getKey().equals(newSessionId)) {
                // JOIN 타입으로 설정하여 새 플레이어가 기존 플레이어를 렌더링할 수 있도록
                PlayerPositionDto player = entry.getValue();
                PlayerPositionDto joinMessage = PlayerPositionDto.builder()
                    .userId(player.getUserId())
                    .nickname(player.getNickname())
                    .x(player.getX())
                    .y(player.getY())
                    .charIndex(player.getCharIndex())
                    .hallId(hallId)
                    .timestamp(player.getTimestamp())
                    .type(PlayerPositionDto.PositionType.JOIN)
                    .build();
                existingPlayers.add(joinMessage);
                log.info("Prepared existing player for broadcast: userId={}, nickname={}", 
                    joinMessage.getUserId(), joinMessage.getNickname());
            }
        }
        
        if (!existingPlayers.isEmpty()) {
            // 기존 플레이어 목록을 일반 브로드캐스트로 전송
            // 새 플레이어는 /topic/hall.{hallId}를 구독하고 있으므로 받을 수 있음
            // 각 플레이어를 JOIN 타입으로 전송 (클라이언트에서 자신의 메시지는 필터링)
            for (PlayerPositionDto player : existingPlayers) {
                String destination = "/topic/hall." + hallId;
                log.info("Broadcasting existing player to {}: userId={}, nickname={}", 
                    destination, player.getUserId(), player.getNickname());
                messagingTemplate.convertAndSend(destination, player);
            }
            log.info("Sent {} existing players to new player in hall {} (sessionId: {})", 
                existingPlayers.size(), hallId, newSessionId);
        } else {
            log.info("No existing players to send (only new player in hall)");
        }
    }
    
    /**
     * 세션 ID로 플레이어 제거 (모든 홀에서)
     * WebSocket 세션이 끊어질 때 자동으로 호출됨
     */
    public void removePlayerBySessionId(String sessionId, SimpMessagingTemplate messagingTemplate) {
        List<Long> hallsToCleanup = new ArrayList<>();
        
        for (Map.Entry<Long, Map<String, PlayerPositionDto>> hallEntry : hallPlayers.entrySet()) {
            Long hallId = hallEntry.getKey();
            Map<String, PlayerPositionDto> players = hallEntry.getValue();
            
            if (players != null && players.containsKey(sessionId)) {
                PlayerPositionDto player = players.get(sessionId);
                log.info("Removing player by session disconnect: hallId={}, sessionId={}, userId={}, nickname={}", 
                    hallId, sessionId, player.getUserId(), player.getNickname());
                
                // LEAVE 메시지 브로드캐스트
                PlayerPositionDto leaveMessage = PlayerPositionDto.builder()
                    .userId(player.getUserId())
                    .nickname(player.getNickname())
                    .x(player.getX())
                    .y(player.getY())
                    .charIndex(player.getCharIndex())
                    .hallId(hallId)
                    .timestamp(java.time.Instant.now())
                    .type(PlayerPositionDto.PositionType.LEAVE)
                    .build();
                
                messagingTemplate.convertAndSend("/topic/hall." + hallId, leaveMessage);
                log.info("Broadcasted LEAVE message for disconnected player: userId={}, nickname={}", 
                    player.getUserId(), player.getNickname());
                
                // 세션 제거
                players.remove(sessionId);
                if (players.isEmpty()) {
                    hallsToCleanup.add(hallId);
                }
            }
        }
        
        // 빈 홀 제거
        for (Long hallId : hallsToCleanup) {
            hallPlayers.remove(hallId);
        }
    }
    
    /**
     * 홀의 활성 플레이어 수 조회
     */
    public int getPlayerCount(Long hallId) {
        Map<String, PlayerPositionDto> players = hallPlayers.get(hallId);
        return players != null ? players.size() : 0;
    }
}


package com.expogarden.controller;

import com.expogarden.dto.BoothStatsDto;
import com.expogarden.dto.ExhibitionStatsDto;
import com.expogarden.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    
    // 전시 통계 (ADMIN만)
    @GetMapping("/exhibitions/{exhibitionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getExhibitionStats(@PathVariable Long exhibitionId) {
        try {
            ExhibitionStatsDto stats = statisticsService.getExhibitionStats(exhibitionId);
            return ResponseEntity.ok(Map.of("data", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }
    
    // 부스 통계 (ADMIN 또는 부스 소유자)
    @GetMapping("/booths/{boothId}")
    @PreAuthorize("hasRole('ADMIN') or @boothSecurityService.isOwner(#boothId, principal)")
    public ResponseEntity<?> getBoothStats(@PathVariable Long boothId) {
        try {
            BoothStatsDto stats = statisticsService.getBoothStats(boothId);
            return ResponseEntity.ok(Map.of("data", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }
}


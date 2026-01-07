package com.expogarden.service;

import com.expogarden.domain.Hall;
import com.expogarden.domain.LayoutType;
import com.expogarden.dto.HallDto;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HallService {
    
    private final HallRepository hallRepository;
    private final BoothRepository boothRepository;
    
    @Transactional(readOnly = true)
    public List<HallDto> getHallsByExhibition(Long exhibitionId) {
        List<Hall> halls = hallRepository.findByExhibitionId(exhibitionId);
        
        return halls.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * 기본 홀을 가져오거나 생성합니다.
     * 개인 쇼룸 플랫폼에서는 하나의 기본 홀만 사용합니다.
     */
    @Transactional
    public Hall getOrCreateDefaultHall(Long exhibitionId) {
        List<Hall> halls = hallRepository.findByExhibitionId(exhibitionId);
        
        // 이미 홀이 있으면 첫 번째 홀 반환
        if (!halls.isEmpty()) {
            return halls.get(0);
        }
        
        // 없으면 기본 홀 생성 (GRID 레이아웃)
        Map<String, Object> layoutConfig = new HashMap<>();
        layoutConfig.put("type", "GRID");
        layoutConfig.put("rows", 10);
        layoutConfig.put("cols", 10);
        layoutConfig.put("spacing", 10.0);
        layoutConfig.put("startX", -50.0);
        layoutConfig.put("startZ", -50.0);
        
        Hall defaultHall = Hall.builder()
            .exhibitionId(exhibitionId)
            .name("메인 홀")
            .layoutType(LayoutType.GRID)
            .layoutConfig(layoutConfig)
            .build();
        
        return hallRepository.save(defaultHall);
    }
    
    private HallDto mapToDto(Hall hall) {
        long boothCount = boothRepository.countByHallIdAndApproved(hall.getId());
        
        return HallDto.builder()
            .id(hall.getId())
            .exhibitionId(hall.getExhibitionId())
            .name(hall.getName())
            .layoutType(hall.getLayoutType())
            .layoutConfig(hall.getLayoutConfig())
            .boothCount(boothCount)
            .createdAt(hall.getCreatedAt())
            .updatedAt(hall.getUpdatedAt())
            .build();
    }
}


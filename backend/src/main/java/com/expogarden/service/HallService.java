package com.expogarden.service;

import com.expogarden.domain.Hall;
import com.expogarden.dto.HallDto;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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


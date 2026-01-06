package com.expogarden.service;

import com.expogarden.domain.Exhibition;
import com.expogarden.domain.ExhibitionStatus;
import com.expogarden.dto.ExhibitionDto;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.ExhibitionRepository;
import com.expogarden.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExhibitionService {
    
    private final ExhibitionRepository exhibitionRepository;
    private final HallRepository hallRepository;
    private final BoothRepository boothRepository;
    
    @Transactional(readOnly = true)
    public Page<ExhibitionDto> getExhibitions(ExhibitionStatus status, Pageable pageable) {
        Page<Exhibition> exhibitions;
        if (status != null) {
            exhibitions = exhibitionRepository.findByStatus(status, pageable);
        } else {
            exhibitions = exhibitionRepository.findAll(pageable);
        }
        
        return exhibitions.map(this::mapToDto);
    }
    
    @Transactional(readOnly = true)
    public ExhibitionDto getExhibition(Long id) {
        Exhibition exhibition = exhibitionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exhibition not found"));
        
        return mapToDto(exhibition);
    }
    
    private ExhibitionDto mapToDto(Exhibition exhibition) {
        long hallCount = hallRepository.findByExhibitionId(exhibition.getId()).size();
        long boothCount = boothRepository.countByExhibitionIdAndApproved(exhibition.getId());
        
        return ExhibitionDto.builder()
            .id(exhibition.getId())
            .slug(exhibition.getSlug())
            .title(exhibition.getTitle())
            .description(exhibition.getDescription())
            .status(exhibition.getStatus())
            .startAt(exhibition.getStartAt())
            .endAt(exhibition.getEndAt())
            .settings(exhibition.getSettings())
            .hallCount(hallCount)
            .boothCount(boothCount)
            .createdAt(exhibition.getCreatedAt())
            .updatedAt(exhibition.getUpdatedAt())
            .build();
    }
}


package com.expogarden.service;

import com.expogarden.domain.Booth;
import com.expogarden.domain.Exhibition;
import com.expogarden.dto.BoothStatsDto;
import com.expogarden.dto.ExhibitionStatsDto;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.ExhibitionRepository;
import com.expogarden.repository.VisitEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final VisitEventRepository visitEventRepository;
    private final BoothRepository boothRepository;
    private final ExhibitionRepository exhibitionRepository;
    
    // 전시 통계
    public ExhibitionStatsDto getExhibitionStats(Long exhibitionId) {
        Exhibition exhibition = exhibitionRepository.findById(exhibitionId)
            .orElseThrow(() -> new RuntimeException("Exhibition not found"));
        
        Long totalViews = visitEventRepository.countViewsByExhibition(exhibitionId);
        Long uniqueVisitors = visitEventRepository.countUniqueVisitorsByExhibition(exhibitionId);
        Long totalBooths = boothRepository.countByExhibitionIdAndNotDeleted(exhibitionId);
        
        // TOP 10 부스
        List<Object[]> topBoothsRaw = visitEventRepository.findTopBoothsByExhibition(exhibitionId, 10);
        List<BoothStatsDto> topBooths = topBoothsRaw.stream()
            .map(row -> BoothStatsDto.builder()
                .boothId(((Number) row[0]).longValue())
                .boothTitle((String) row[1])
                .totalViews(((Number) row[2]).longValue())
                .uniqueVisitors(((Number) row[3]).longValue())
                .build())
            .collect(Collectors.toList());
        
        return ExhibitionStatsDto.builder()
            .exhibitionId(exhibitionId)
            .exhibitionTitle(exhibition.getTitle())
            .totalViews(totalViews)
            .uniqueVisitors(uniqueVisitors)
            .totalBooths(totalBooths)
            .topBooths(topBooths)
            .build();
    }
    
    // 부스 통계
    public BoothStatsDto getBoothStats(Long boothId) {
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        Long totalViews = visitEventRepository.countViewsByBooth(boothId);
        Long uniqueVisitors = visitEventRepository.countUniqueVisitorsByBooth(boothId);
        Long clickEvents = visitEventRepository.countByBoothAndAction(boothId, "CLICK_LINK");
        Long videoPlays = visitEventRepository.countByBoothAndAction(boothId, "PLAY_VIDEO");
        
        return BoothStatsDto.builder()
            .boothId(boothId)
            .boothTitle(booth.getTitle())
            .totalViews(totalViews)
            .uniqueVisitors(uniqueVisitors)
            .clickEvents(clickEvents)
            .videoPlays(videoPlays)
            .build();
    }
}


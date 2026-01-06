package com.expogarden.service;

import com.expogarden.domain.VisitEvent;
import com.expogarden.dto.TrackEventRequest;
import com.expogarden.repository.VisitEventRepository;
import com.expogarden.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrackingService {
    
    private final VisitEventRepository visitEventRepository;
    
    @Transactional
    public void trackEvent(TrackEventRequest request, UserPrincipal principal) {
        VisitEvent event = VisitEvent.builder()
            .exhibitionId(request.getExhibitionId())
            .boothId(request.getBoothId())
            .userId(principal != null ? principal.getId() : null)
            .sessionId(request.getSessionId())
            .action(request.getAction())
            .metadata(request.getMetadata())
            .build();
        
        visitEventRepository.save(event);
    }
    
    @Transactional
    public void trackEvents(List<TrackEventRequest> requests, UserPrincipal principal) {
        for (TrackEventRequest request : requests) {
            trackEvent(request, principal);
        }
    }
}


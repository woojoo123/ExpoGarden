package com.expogarden.controller;

import com.expogarden.dto.TrackEventRequest;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.TrackingService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/track")
@RequiredArgsConstructor
public class TrackingController {
    
    private final TrackingService trackingService;
    
    @PostMapping
    public ResponseEntity<?> track(
        @Valid @RequestBody TrackingRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (request.getEvents() != null && !request.getEvents().isEmpty()) {
            trackingService.trackEvents(request.getEvents(), principal);
            return ResponseEntity.ok(Map.of("data", Map.of("recorded", request.getEvents().size())));
        } else if (request.getEvent() != null) {
            trackingService.trackEvent(request.getEvent(), principal);
            return ResponseEntity.ok(Map.of("data", Map.of("recorded", 1)));
        } else {
            throw new RuntimeException("No events provided");
        }
    }
    
    @Data
    public static class TrackingRequest {
        private TrackEventRequest event;
        private List<TrackEventRequest> events;
    }
}


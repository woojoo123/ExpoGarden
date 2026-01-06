package com.expogarden.controller;

import com.expogarden.domain.ExhibitionStatus;
import com.expogarden.dto.ExhibitionDto;
import com.expogarden.dto.HallDto;
import com.expogarden.service.ExhibitionService;
import com.expogarden.service.HallService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/exhibitions")
@RequiredArgsConstructor
public class ExhibitionController {
    
    private final ExhibitionService exhibitionService;
    private final HallService hallService;
    
    @GetMapping
    public ResponseEntity<?> getExhibitions(
        @RequestParam(required = false) ExhibitionStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ExhibitionDto> exhibitions = exhibitionService.getExhibitions(status, pageable);
        
        return ResponseEntity.ok(Map.of("data", Map.of(
            "content", exhibitions.getContent(),
            "totalElements", exhibitions.getTotalElements(),
            "totalPages", exhibitions.getTotalPages(),
            "size", exhibitions.getSize(),
            "number", exhibitions.getNumber()
        )));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getExhibition(@PathVariable Long id) {
        ExhibitionDto exhibition = exhibitionService.getExhibition(id);
        return ResponseEntity.ok(Map.of("data", exhibition));
    }
    
    @GetMapping("/{exhibitionId}/halls")
    public ResponseEntity<?> getHalls(@PathVariable Long exhibitionId) {
        List<HallDto> halls = hallService.getHallsByExhibition(exhibitionId);
        return ResponseEntity.ok(Map.of("data", halls));
    }
}


package com.expogarden.controller;

import com.expogarden.domain.BoothStatus;
import com.expogarden.dto.BoothCreateRequest;
import com.expogarden.dto.BoothDto;
import com.expogarden.dto.RejectRequest;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.BoothService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/booths")
@RequiredArgsConstructor
public class BoothController {
    
    private final BoothService boothService;
    
    @GetMapping
    public ResponseEntity<?> getBooths(
        @RequestParam(required = false) Long exhibitionId,
        @RequestParam(required = false) Long hallId,
        @RequestParam(required = false) BoothStatus status,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equals("asc") 
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<BoothDto> booths = boothService.getBooths(exhibitionId, hallId, status, category, q, pageable);
        
        return ResponseEntity.ok(Map.of("data", Map.of(
            "content", booths.getContent(),
            "totalElements", booths.getTotalElements(),
            "totalPages", booths.getTotalPages(),
            "size", booths.getSize(),
            "number", booths.getNumber()
        )));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("@boothSecurityService.canAccessBooth(#id, principal)")
    public ResponseEntity<?> getBooth(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothDto booth = boothService.getBooth(id);
        return ResponseEntity.ok(Map.of("data", booth));
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createBooth(
        @Valid @RequestBody BoothCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothDto booth = boothService.createBooth(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", booth));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@boothSecurityService.canModifyBooth(#id, principal)")
    public ResponseEntity<?> updateBooth(
        @PathVariable Long id,
        @Valid @RequestBody BoothCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothDto booth = boothService.updateBooth(id, request);
        return ResponseEntity.ok(Map.of("data", booth));
    }
    
    @PostMapping("/{id}/submit")
    @PreAuthorize("@boothSecurityService.canModifyBooth(#id, principal)")
    public ResponseEntity<?> submitBooth(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothDto booth = boothService.submitBooth(id, principal);
        return ResponseEntity.ok(Map.of("data", booth));
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveBooth(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothDto booth = boothService.approveBooth(id, principal);
        return ResponseEntity.ok(Map.of("data", booth));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectBooth(
        @PathVariable Long id,
        @Valid @RequestBody RejectRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothDto booth = boothService.rejectBooth(id, request.getReason(), principal);
        return ResponseEntity.ok(Map.of("data", booth));
    }
    
    @PostMapping("/{id}/archive")
    @PreAuthorize("@boothSecurityService.canModifyBooth(#id, principal)")
    public ResponseEntity<?> archiveBooth(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothDto booth = boothService.archiveBooth(id, principal);
        return ResponseEntity.ok(Map.of("data", booth));
    }
}


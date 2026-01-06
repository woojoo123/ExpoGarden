package com.expogarden.controller;

import com.expogarden.domain.MemberRole;
import com.expogarden.dto.BoothMemberDto;
import com.expogarden.dto.BoothMemberRequest;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.BoothMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/booths/{boothId}/members")
@RequiredArgsConstructor
public class BoothMemberController {
    
    private final BoothMemberService boothMemberService;
    
    @GetMapping
    @PreAuthorize("@boothSecurityService.canAccessBooth(#boothId, principal)")
    public ResponseEntity<?> getMembers(
        @PathVariable Long boothId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<BoothMemberDto> members = boothMemberService.getBoothMembers(boothId);
        return ResponseEntity.ok(Map.of("data", members));
    }
    
    @PostMapping
    @PreAuthorize("@boothSecurityService.canManageMembers(#boothId, principal)")
    public ResponseEntity<?> addMember(
        @PathVariable Long boothId,
        @Valid @RequestBody BoothMemberRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        BoothMemberDto member = boothMemberService.addMember(boothId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", member));
    }
    
    @PutMapping("/{userId}")
    @PreAuthorize("@boothSecurityService.canManageMembers(#boothId, principal)")
    public ResponseEntity<?> updateMemberRole(
        @PathVariable Long boothId,
        @PathVariable Long userId,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        MemberRole newRole = MemberRole.valueOf(body.get("role"));
        BoothMemberDto member = boothMemberService.updateMemberRole(boothId, userId, newRole);
        return ResponseEntity.ok(Map.of("data", member));
    }
    
    @DeleteMapping("/{userId}")
    @PreAuthorize("@boothSecurityService.canManageMembers(#boothId, principal)")
    public ResponseEntity<?> removeMember(
        @PathVariable Long boothId,
        @PathVariable Long userId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        boothMemberService.removeMember(boothId, userId);
        return ResponseEntity.ok(Map.of("data", Map.of("message", "Member removed successfully")));
    }
}


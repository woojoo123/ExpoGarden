package com.expogarden.controller;

import com.expogarden.dto.BoothMemberDto;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.BoothMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/my/memberships")
@RequiredArgsConstructor
public class MyMembershipController {
    
    private final BoothMemberService boothMemberService;
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyMemberships(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<BoothMemberDto> memberships = boothMemberService.getMyMemberships(principal.getId());
        return ResponseEntity.ok(Map.of("data", memberships));
    }
}


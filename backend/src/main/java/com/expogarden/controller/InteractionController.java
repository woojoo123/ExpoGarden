package com.expogarden.controller;

import com.expogarden.dto.GuestbookCreateRequest;
import com.expogarden.dto.GuestbookDto;
import com.expogarden.dto.QuestionCreateRequest;
import com.expogarden.dto.QuestionDto;
import com.expogarden.security.UserPrincipal;
import com.expogarden.service.GuestbookService;
import com.expogarden.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class InteractionController {
    
    private final QuestionService questionService;
    private final GuestbookService guestbookService;
    
    @GetMapping("/booths/{boothId}/questions")
    public ResponseEntity<?> getQuestions(
        @PathVariable Long boothId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<QuestionDto> questions = questionService.getQuestions(boothId, pageable);
        
        return ResponseEntity.ok(Map.of("data", Map.of(
            "content", questions.getContent(),
            "totalElements", questions.getTotalElements(),
            "totalPages", questions.getTotalPages(),
            "size", questions.getSize(),
            "number", questions.getNumber()
        )));
    }
    
    @PostMapping("/booths/{boothId}/questions")
    public ResponseEntity<?> createQuestion(
        @PathVariable Long boothId,
        @Valid @RequestBody QuestionCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        QuestionDto question = questionService.createQuestion(boothId, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", question));
    }
    
    @GetMapping("/booths/{boothId}/guestbook")
    public ResponseEntity<?> getGuestbook(
        @PathVariable Long boothId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<GuestbookDto> guestbook = guestbookService.getGuestbook(boothId, pageable);
        
        return ResponseEntity.ok(Map.of("data", Map.of(
            "content", guestbook.getContent(),
            "totalElements", guestbook.getTotalElements(),
            "totalPages", guestbook.getTotalPages(),
            "size", guestbook.getSize(),
            "number", guestbook.getNumber()
        )));
    }
    
    @PostMapping("/booths/{boothId}/guestbook")
    public ResponseEntity<?> createGuestbookEntry(
        @PathVariable Long boothId,
        @Valid @RequestBody GuestbookCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        GuestbookDto entry = guestbookService.createEntry(boothId, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", entry));
    }
}


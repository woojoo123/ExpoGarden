package com.expogarden.service;

import com.expogarden.domain.Booth;
import com.expogarden.domain.ContentStatus;
import com.expogarden.domain.GuestbookEntry;
import com.expogarden.domain.User;
import com.expogarden.dto.GuestbookCreateRequest;
import com.expogarden.dto.GuestbookDto;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.GuestbookRepository;
import com.expogarden.repository.UserRepository;
import com.expogarden.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GuestbookService {
    
    private final GuestbookRepository guestbookRepository;
    private final BoothRepository boothRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public Page<GuestbookDto> getGuestbook(Long boothId, Pageable pageable) {
        Page<GuestbookEntry> entries = guestbookRepository.findByBoothIdAndStatus(
            boothId, ContentStatus.VISIBLE, pageable
        );
        
        return entries.map(this::mapToDto);
    }
    
    @Transactional
    public GuestbookDto createEntry(
        Long boothId,
        GuestbookCreateRequest request,
        UserPrincipal principal
    ) {
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        // 권한 체크: 로그인 또는 게스트 허용 여부
        if (principal == null && !booth.getAllowGuestGuestbook()) {
            throw new RuntimeException("Guest guestbook entries are not allowed for this booth");
        }
        
        GuestbookEntry entry = GuestbookEntry.builder()
            .boothId(boothId)
            .userId(principal != null ? principal.getId() : null)
            .guestSessionId(principal == null ? request.getGuestSessionId() : null)
            .message(request.getMessage())
            .status(ContentStatus.VISIBLE)
            .build();
        
        entry = guestbookRepository.save(entry);
        
        return mapToDto(entry);
    }
    
    private GuestbookDto mapToDto(GuestbookEntry entry) {
        User user = entry.getUserId() != null 
            ? userRepository.findById(entry.getUserId()).orElse(null)
            : null;
        
        return GuestbookDto.builder()
            .id(entry.getId())
            .boothId(entry.getBoothId())
            .exhibitionId(entry.getExhibitionId())
            .userId(entry.getUserId())
            .userNickname(user != null ? user.getNickname() : "게스트")
            .guestSessionId(entry.getGuestSessionId())
            .message(entry.getMessage())
            .status(entry.getStatus().name())
            .createdAt(entry.getCreatedAt())
            .build();
    }
}


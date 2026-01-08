package com.expogarden.service;

import com.expogarden.domain.*;
import com.expogarden.dto.*;
import com.expogarden.repository.*;
import com.expogarden.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoothService {
    
    private final BoothRepository boothRepository;
    private final BoothMediaRepository boothMediaRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public Page<BoothDto> getBooths(
        Long exhibitionId,
        Long hallId,
        BoothStatus status,
        String category,
        String query,
        Pageable pageable
    ) {
        Specification<Booth> spec = Specification.where(null);
        
        // deleted_at IS NULL
        spec = spec.and((root, q, cb) -> cb.isNull(root.get("deletedAt")));
        
        if (exhibitionId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("exhibitionId"), exhibitionId));
        }
        
        if (hallId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("hallId"), hallId));
        }
        
        if (status != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), status));
        } else {
            // 기본값은 APPROVED만 조회
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), BoothStatus.APPROVED));
        }
        
        if (category != null && !category.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("category"), category));
        }
        
        if (query != null && !query.isBlank()) {
            String likePattern = "%" + query.toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), likePattern),
                cb.like(cb.lower(root.get("description")), likePattern)
            ));
        }
        
        Page<Booth> booths = boothRepository.findAll(spec, pageable);
        return booths.map(this::mapToDto);
    }
    
    @Transactional(readOnly = true)
    public BoothDto getBooth(Long id) {
        Booth booth = boothRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        return mapToDtoWithMedia(booth);
    }
    
    @Transactional
    public BoothDto createBooth(BoothCreateRequest request, UserPrincipal principal) {
        // 전시는 1번 고정, 홀은 카테고리 기반으로 할당
        Long exhibitionId = 1L;
        Long hallId = getCategoryHallId(request.getCategory());
        
        Booth booth = Booth.builder()
            .exhibitionId(exhibitionId)
            .hallId(hallId)
            .ownerUserId(principal.getId())
            .status(BoothStatus.DRAFT)
            .title(request.getTitle())
            .summary(request.getSummary())
            .description(request.getDescription())
            .category(request.getCategory())
            .thumbnailUrl(request.getThumbnailUrl())
            .tags(request.getTags())
            .allowGuestQuestions(request.getAllowGuestQuestions())
            .allowGuestGuestbook(request.getAllowGuestGuestbook())
            .posOverride(request.getPosOverride())
            .build();
        
        booth = boothRepository.save(booth);
        
        // 미디어 저장
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            saveMedia(booth.getId(), request.getMedia());
        }
        
        return mapToDtoWithMedia(booth);
    }
    
    @Transactional
    public BoothDto updateBooth(Long id, BoothCreateRequest request) {
        Booth booth = boothRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        booth.setTitle(request.getTitle());
        booth.setSummary(request.getSummary());
        booth.setDescription(request.getDescription());
        booth.setCategory(request.getCategory());
        booth.setThumbnailUrl(request.getThumbnailUrl());
        booth.setTags(request.getTags());
        booth.setAllowGuestQuestions(request.getAllowGuestQuestions());
        booth.setAllowGuestGuestbook(request.getAllowGuestGuestbook());
        booth.setPosOverride(request.getPosOverride());
        
        booth = boothRepository.save(booth);
        
        // 미디어 재저장
        boothMediaRepository.deleteByBoothId(id);
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            saveMedia(booth.getId(), request.getMedia());
        }
        
        return mapToDtoWithMedia(booth);
    }
    
    @Transactional
    public BoothDto submitBooth(Long id, UserPrincipal principal) {
        Booth booth = boothRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        if (booth.getStatus() != BoothStatus.DRAFT && booth.getStatus() != BoothStatus.REJECTED) {
            throw new RuntimeException("Only DRAFT or REJECTED booths can be submitted");
        }
        
        booth.setStatus(BoothStatus.SUBMITTED);
        booth.setSubmittedAt(Instant.now());
        booth = boothRepository.save(booth);
        
        return mapToDtoWithMedia(booth);
    }
    
    @Transactional
    public BoothDto approveBooth(Long id, UserPrincipal principal) {
        Booth booth = boothRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        if (booth.getStatus() != BoothStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED booths can be approved");
        }
        
        booth.setStatus(BoothStatus.APPROVED);
        booth.setApprovedAt(Instant.now());
        booth.setApprovedBy(principal.getId());
        booth = boothRepository.save(booth);
        
        return mapToDtoWithMedia(booth);
    }
    
    @Transactional
    public BoothDto rejectBooth(Long id, String reason, UserPrincipal principal) {
        Booth booth = boothRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        if (booth.getStatus() != BoothStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED booths can be rejected");
        }
        
        booth.setStatus(BoothStatus.REJECTED);
        booth.setRejectedAt(Instant.now());
        booth.setRejectedBy(principal.getId());
        booth.setRejectReason(reason);
        booth = boothRepository.save(booth);
        
        return mapToDtoWithMedia(booth);
    }
    
    @Transactional
    public BoothDto archiveBooth(Long id, UserPrincipal principal) {
        Booth booth = boothRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        if (booth.getStatus() != BoothStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED booths can be archived");
        }
        
        booth.setStatus(BoothStatus.ARCHIVED);
        booth.setArchivedAt(Instant.now());
        booth.setArchivedBy(principal.getId());
        booth = boothRepository.save(booth);
        
        return mapToDtoWithMedia(booth);
    }
    
    private void saveMedia(Long boothId, List<BoothMediaDto> mediaList) {
        for (BoothMediaDto mediaDto : mediaList) {
            BoothMedia media = BoothMedia.builder()
                .boothId(boothId)
                .type(mediaDto.getType())
                .url(mediaDto.getUrl())
                .title(mediaDto.getTitle())
                .sortOrder(mediaDto.getSortOrder())
                .build();
            boothMediaRepository.save(media);
        }
    }
    
    private BoothDto mapToDto(Booth booth) {
        User owner = userRepository.findById(booth.getOwnerUserId()).orElse(null);
        
        return BoothDto.builder()
            .id(booth.getId())
            .exhibitionId(booth.getExhibitionId())
            .hallId(booth.getHallId())
            .ownerUserId(booth.getOwnerUserId())
            .ownerNickname(owner != null ? owner.getNickname() : "Unknown")
            .status(booth.getStatus())
            .title(booth.getTitle())
            .summary(booth.getSummary())
            .category(booth.getCategory())
            .thumbnailUrl(booth.getThumbnailUrl())
            .tags(booth.getTags())
            .allowGuestQuestions(booth.getAllowGuestQuestions())
            .allowGuestGuestbook(booth.getAllowGuestGuestbook())
            .approvedAt(booth.getApprovedAt())
            .createdAt(booth.getCreatedAt())
            .updatedAt(booth.getUpdatedAt())
            .build();
    }
    
    private BoothDto mapToDtoWithMedia(Booth booth) {
        BoothDto dto = mapToDto(booth);
        dto.setDescription(booth.getDescription());
        dto.setPosOverride(booth.getPosOverride());
        
        List<BoothMedia> mediaList = boothMediaRepository.findByBoothIdOrderBySortOrderAsc(booth.getId());
        dto.setMedia(mediaList.stream()
            .map(m -> BoothMediaDto.builder()
                .id(m.getId())
                .type(m.getType())
                .url(m.getUrl())
                .title(m.getTitle())
                .sortOrder(m.getSortOrder())
                .build())
            .collect(Collectors.toList()));
        
        return dto;
    }
    
    /**
     * 카테고리 문자열을 해당하는 홀 ID로 변환
     * @param category 부스 카테고리
     * @return 홀 ID (1-9)
     */
    private Long getCategoryHallId(String category) {
        if (category == null || category.isBlank()) {
            return 9L; // 기본값: 기타 홀
        }
        
        return switch (category) {
            case "AI" -> 1L;
            case "게임" -> 2L;
            case "아트/디자인" -> 3L;
            case "사진/영상" -> 4L;
            case "일러스트" -> 5L;
            case "음악" -> 6L;
            case "3D" -> 7L;
            case "프로그래밍" -> 8L;
            default -> 9L; // 기타
        };
    }
}


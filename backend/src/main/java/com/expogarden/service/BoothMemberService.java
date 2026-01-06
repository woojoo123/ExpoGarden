package com.expogarden.service;

import com.expogarden.domain.BoothMember;
import com.expogarden.domain.MemberRole;
import com.expogarden.domain.User;
import com.expogarden.dto.BoothMemberDto;
import com.expogarden.dto.BoothMemberRequest;
import com.expogarden.repository.BoothMemberRepository;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoothMemberService {
    
    private final BoothMemberRepository boothMemberRepository;
    private final BoothRepository boothRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<BoothMemberDto> getBoothMembers(Long boothId) {
        // 부스 존재 확인
        boothRepository.findByIdAndNotDeleted(boothId)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        List<BoothMember> members = boothMemberRepository.findByBoothId(boothId);
        
        return members.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public BoothMemberDto addMember(Long boothId, BoothMemberRequest request) {
        // 부스 존재 확인
        boothRepository.findByIdAndNotDeleted(boothId)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        // 사용자 존재 확인
        userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 이미 멤버인지 확인
        if (boothMemberRepository.existsByBoothIdAndUserId(boothId, request.getUserId())) {
            throw new RuntimeException("User is already a member of this booth");
        }
        
        BoothMember member = BoothMember.builder()
            .boothId(boothId)
            .userId(request.getUserId())
            .role(request.getRole())
            .build();
        
        member = boothMemberRepository.save(member);
        
        return mapToDto(member);
    }
    
    @Transactional
    public BoothMemberDto updateMemberRole(Long boothId, Long userId, MemberRole newRole) {
        BoothMember member = boothMemberRepository.findByBoothIdAndUserId(boothId, userId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        
        member.setRole(newRole);
        member = boothMemberRepository.save(member);
        
        return mapToDto(member);
    }
    
    @Transactional
    public void removeMember(Long boothId, Long userId) {
        if (!boothMemberRepository.existsByBoothIdAndUserId(boothId, userId)) {
            throw new RuntimeException("Member not found");
        }
        
        boothMemberRepository.deleteByBoothIdAndUserId(boothId, userId);
    }
    
    @Transactional(readOnly = true)
    public List<BoothMemberDto> getMyMemberships(Long userId) {
        List<BoothMember> members = boothMemberRepository.findByUserId(userId);
        
        return members.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    private BoothMemberDto mapToDto(BoothMember member) {
        User user = userRepository.findById(member.getUserId()).orElse(null);
        
        return BoothMemberDto.builder()
            .id(member.getId())
            .boothId(member.getBoothId())
            .userId(member.getUserId())
            .userNickname(user != null ? user.getNickname() : "Unknown")
            .userEmail(user != null ? user.getEmail() : "")
            .role(member.getRole())
            .createdAt(member.getCreatedAt())
            .build();
    }
}


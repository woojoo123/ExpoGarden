package com.expogarden.security;

import com.expogarden.domain.Booth;
import com.expogarden.domain.BoothMember;
import com.expogarden.domain.BoothStatus;
import com.expogarden.domain.MemberRole;
import com.expogarden.repository.BoothMemberRepository;
import com.expogarden.repository.BoothRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service("boothSecurityService")
@RequiredArgsConstructor
public class BoothSecurityService {
    
    private final BoothRepository boothRepository;
    private final BoothMemberRepository boothMemberRepository;
    
    public boolean isOwner(Long boothId, UserPrincipal principal) {
        if (principal == null) return false;
        
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId).orElse(null);
        if (booth == null) return false;
        
        // 1. 실제 owner 확인
        if (booth.getOwnerUserId().equals(principal.getId())) {
            return true;
        }
        
        // 2. booth_members에서 OWNER 역할 확인
        return boothMemberRepository.existsByBoothIdAndUserIdAndRoleIn(
            boothId, 
            principal.getId(), 
            Arrays.asList(MemberRole.OWNER)
        );
    }
    
    public boolean canAccessBooth(Long boothId, UserPrincipal principal) {
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId).orElse(null);
        if (booth == null) return false;
        
        // APPROVED는 모두 접근 가능
        if (booth.getStatus() == BoothStatus.APPROVED) return true;
        
        // 그 외는 ADMIN, owner, 또는 멤버만
        if (principal == null) return false;
        
        if (principal.hasRole("ADMIN")) return true;
        if (booth.getOwnerUserId().equals(principal.getId())) return true;
        
        // booth_members 확인 (모든 역할 허용)
        return boothMemberRepository.existsByBoothIdAndUserId(boothId, principal.getId());
    }
    
    public boolean canModifyBooth(Long boothId, UserPrincipal principal) {
        if (principal == null) return false;
        if (principal.hasRole("ADMIN")) return true;
        
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId).orElse(null);
        if (booth == null) return false;
        
        // 1. owner 확인
        if (booth.getOwnerUserId().equals(principal.getId())) {
            return true;
        }
        
        // 2. booth_members에서 OWNER 또는 EDITOR 역할 확인
        return boothMemberRepository.existsByBoothIdAndUserIdAndRoleIn(
            boothId, 
            principal.getId(), 
            Arrays.asList(MemberRole.OWNER, MemberRole.EDITOR)
        );
    }
    
    /**
     * 멤버 관리 권한 (멤버 추가/삭제)
     */
    public boolean canManageMembers(Long boothId, UserPrincipal principal) {
        if (principal == null) return false;
        if (principal.hasRole("ADMIN")) return true;
        
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId).orElse(null);
        if (booth == null) return false;
        
        // owner만 가능
        return booth.getOwnerUserId().equals(principal.getId()) ||
               boothMemberRepository.existsByBoothIdAndUserIdAndRoleIn(
                   boothId, 
                   principal.getId(), 
                   Arrays.asList(MemberRole.OWNER)
               );
    }
}


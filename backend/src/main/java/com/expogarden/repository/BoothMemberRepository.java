package com.expogarden.repository;

import com.expogarden.domain.BoothMember;
import com.expogarden.domain.MemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoothMemberRepository extends JpaRepository<BoothMember, Long> {
    List<BoothMember> findByBoothId(Long boothId);
    List<BoothMember> findByUserId(Long userId);
    Optional<BoothMember> findByBoothIdAndUserId(Long boothId, Long userId);
    boolean existsByBoothIdAndUserId(Long boothId, Long userId);
    void deleteByBoothIdAndUserId(Long boothId, Long userId);
    
    // 특정 역할로 멤버인지 확인
    boolean existsByBoothIdAndUserIdAndRoleIn(Long boothId, Long userId, List<MemberRole> roles);
}


package com.expogarden.repository;

import com.expogarden.domain.VisitEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitEventRepository extends JpaRepository<VisitEvent, Long> {
    // 통계용 쿼리는 2단계에서 추가
}


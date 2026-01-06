package com.expogarden.repository;

import com.expogarden.domain.VisitEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitEventRepository extends JpaRepository<VisitEvent, Long> {
    
    // 전시별 총 조회수
    @Query("SELECT COUNT(v) FROM VisitEvent v WHERE v.exhibitionId = :exhibitionId AND v.action = 'VIEW'")
    Long countViewsByExhibition(@Param("exhibitionId") Long exhibitionId);
    
    // 전시별 고유 방문자 수
    @Query("SELECT COUNT(DISTINCT v.sessionId) FROM VisitEvent v WHERE v.exhibitionId = :exhibitionId")
    Long countUniqueVisitorsByExhibition(@Param("exhibitionId") Long exhibitionId);
    
    // 부스별 총 조회수
    @Query("SELECT COUNT(v) FROM VisitEvent v WHERE v.boothId = :boothId AND v.action = 'VIEW'")
    Long countViewsByBooth(@Param("boothId") Long boothId);
    
    // 부스별 고유 방문자 수
    @Query("SELECT COUNT(DISTINCT v.sessionId) FROM VisitEvent v WHERE v.boothId = :boothId")
    Long countUniqueVisitorsByBooth(@Param("boothId") Long boothId);
    
    // 부스별 특정 액션 카운트
    @Query("SELECT COUNT(v) FROM VisitEvent v WHERE v.boothId = :boothId AND v.action = :action")
    Long countByBoothAndAction(@Param("boothId") Long boothId, @Param("action") String action);
    
    // TOP 부스 (네이티브 쿼리)
    @Query(value = """
        SELECT v.booth_id, b.title, COUNT(*) as view_count,
               COUNT(DISTINCT v.session_id) as unique_visitors
        FROM visit_events v
        JOIN booths b ON v.booth_id = b.id
        WHERE v.exhibition_id = :exhibitionId 
          AND v.action = 'VIEW'
          AND v.booth_id IS NOT NULL
          AND b.deleted_at IS NULL
        GROUP BY v.booth_id, b.title
        ORDER BY view_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findTopBoothsByExhibition(@Param("exhibitionId") Long exhibitionId, @Param("limit") int limit);
}


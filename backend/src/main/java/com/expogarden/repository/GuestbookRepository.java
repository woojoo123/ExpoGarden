package com.expogarden.repository;

import com.expogarden.domain.ContentStatus;
import com.expogarden.domain.GuestbookEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestbookRepository extends JpaRepository<GuestbookEntry, Long> {
    Page<GuestbookEntry> findByBoothIdAndStatus(Long boothId, ContentStatus status, Pageable pageable);
    Page<GuestbookEntry> findByBoothId(Long boothId, Pageable pageable);
    Page<GuestbookEntry> findByExhibitionIdAndStatus(Long exhibitionId, ContentStatus status, Pageable pageable);
}


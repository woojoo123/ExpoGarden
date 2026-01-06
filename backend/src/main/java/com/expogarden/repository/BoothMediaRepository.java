package com.expogarden.repository;

import com.expogarden.domain.BoothMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoothMediaRepository extends JpaRepository<BoothMedia, Long> {
    List<BoothMedia> findByBoothIdOrderBySortOrderAsc(Long boothId);
    void deleteByBoothId(Long boothId);
}


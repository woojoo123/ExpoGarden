package com.expogarden.repository;

import com.expogarden.domain.Exhibition;
import com.expogarden.domain.ExhibitionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExhibitionRepository extends JpaRepository<Exhibition, Long> {
    Optional<Exhibition> findBySlug(String slug);
    Page<Exhibition> findByStatus(ExhibitionStatus status, Pageable pageable);
}


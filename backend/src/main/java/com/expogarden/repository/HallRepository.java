package com.expogarden.repository;

import com.expogarden.domain.Hall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HallRepository extends JpaRepository<Hall, Long> {
    List<Hall> findByExhibitionId(Long exhibitionId);
}


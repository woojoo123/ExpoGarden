package com.expogarden.repository;

import com.expogarden.domain.ContentStatus;
import com.expogarden.domain.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    Page<Question> findByBoothIdAndStatus(Long boothId, ContentStatus status, Pageable pageable);
    Page<Question> findByBoothId(Long boothId, Pageable pageable);
}


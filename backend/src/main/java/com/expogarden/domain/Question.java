package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "questions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "booth_id", nullable = false)
    private Long boothId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "guest_session_id", length = 255)
    private String guestSessionId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContentStatus status = ContentStatus.VISIBLE;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "guestbook_entries")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestbookEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "booth_id")
    private Long boothId;
    
    @Column(name = "exhibition_id")
    private Long exhibitionId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "guest_session_id", length = 255)
    private String guestSessionId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContentStatus status = ContentStatus.VISIBLE;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


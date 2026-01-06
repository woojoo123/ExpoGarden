package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "visit_events")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "exhibition_id", nullable = false)
    private Long exhibitionId;
    
    @Column(name = "booth_id")
    private Long boothId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "session_id", nullable = false, length = 255)
    private String sessionId;
    
    @Column(nullable = false, length = 50)
    private String action;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


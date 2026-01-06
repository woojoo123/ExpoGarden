package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "booths")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booth {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "exhibition_id", nullable = false)
    private Long exhibitionId;
    
    @Column(name = "hall_id", nullable = false)
    private Long hallId;
    
    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BoothStatus status = BoothStatus.DRAFT;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(length = 500)
    private String summary;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 100)
    private String category;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;
    
    @Column(name = "allow_guest_questions", nullable = false)
    @Builder.Default
    private Boolean allowGuestQuestions = false;
    
    @Column(name = "allow_guest_guestbook", nullable = false)
    @Builder.Default
    private Boolean allowGuestGuestbook = false;
    
    @Column(name = "submitted_at")
    private Instant submittedAt;
    
    @Column(name = "approved_at")
    private Instant approvedAt;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "rejected_at")
    private Instant rejectedAt;
    
    @Column(name = "rejected_by")
    private Long rejectedBy;
    
    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;
    
    @Column(name = "archived_at")
    private Instant archivedAt;
    
    @Column(name = "archived_by")
    private Long archivedBy;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "pos_override", columnDefinition = "jsonb")
    private Map<String, Object> posOverride;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
    
    @Column(name = "deleted_at")
    private Instant deletedAt;
}


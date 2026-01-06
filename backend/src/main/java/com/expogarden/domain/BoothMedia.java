package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "booth_media")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoothMedia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "booth_id", nullable = false)
    private Long boothId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType type;
    
    @Column(nullable = false, length = 1000)
    private String url;
    
    @Column(length = 255)
    private String title;
    
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "halls")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hall {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "exhibition_id", nullable = false)
    private Long exhibitionId;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "layout_type", nullable = false, length = 20)
    private LayoutType layoutType;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_config", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> layoutConfig;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}


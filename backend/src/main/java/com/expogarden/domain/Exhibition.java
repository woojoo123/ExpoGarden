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
@Table(name = "exhibitions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exhibition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String slug;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    // 전시에 대한 설명 필드입니다. TEXT 타입으로 길이 제한이 없습니다.
    @Column(columnDefinition = "TEXT")
    private String description;
    

    // @Builder.Default가 있으면 빌더 패턴 사용시에도 기본값이 적용되고,
    // 없으면 빌더로 생성할 땐 명시적으로 값을 넣지 않으면 null이 됩니다.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExhibitionStatus status = ExhibitionStatus.DRAFT;
    
    @Column(name = "start_at")
    private Instant startAt;
    
    @Column(name = "end_at")
    private Instant endAt;
    
    // 전시별로 다양한 커스텀 세팅을 저장하는 JSON 필드
    /*  예시 1: 테마 설정
    settings = {
        "theme": "dark",
        "primaryColor": "#007bff",
        "logoUrl": "https://example.com/logo.png"
    }*/
   /*
   유연성: 전시마다 다른 설정이 필요할 때 스키마 변경 없이 대응
    확장성: 새로운 설정 추가가 쉬움
    효율성: PostgreSQL의 jsonb로 빠른 검색과 인덱싱 가능
   */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> settings;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    
    // 수정(업데이트)된 시간을 자동으로 기록하는 필드입니다.
    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}


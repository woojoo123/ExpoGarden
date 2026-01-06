package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity  // JPA Entity 선언
@Table(name = "users")  // 테이블 이름 설정
@EntityListeners(AuditingEntityListener.class)  // 생성 시간 자동 기록

// lombok 어노테이션 : getter, setter, 생성자, 빌더 등 자동 생성
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    

    // @Id : 기본 키 설정
    // @GeneratedValue(strategy = GenerationType.IDENTITY) : 기본 키 자동 생성
    // private Long id; : 기본 키 필드
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(name = "password_hash", length = 255)
    private String passwordHash;
    
    // 사용자의 권한(ADMIN, EXHIBITOR, VISITOR) 정보를 저장하는 필드. 
    // Enum 타입을 문자열로 DB에 저장하며, 필수 입력값(널 허용 안함).
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;
    
    @Column(nullable = false, length = 100)
    private String nickname;
    
    // CreatedDate : 생성 시간 자동 기록
    // updatable : 수정 가능 여부
    // Instant 타입은 java.time.Instant 클래스로, 타임스탬프(즉, 특정 시점의 날짜와 시간)를 UTC 기준으로 나타내는 타입입니다.
    // 주로 생성시간이나 수정시간과 같이 변경 불가능한(immutable) 시점을 저장하는 데 사용됩니다.
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}


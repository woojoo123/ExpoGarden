# 권한/인가 설계

## 개요
- **모델**: RBAC(Role-Based Access Control) + 리소스 소유권(Ownership)
- **역할**: ADMIN, EXHIBITOR, VISITOR
- **인증**: JWT Access + Refresh Token

---

## 역할(Role) 정의

### ADMIN (운영자)
- **권한**:
  - 모든 전시/홀/부스 조회/수정/삭제
  - 부스 승인/반려/아카이브
  - 사용자 관리
  - 통계/로그 조회
  - 질문/방명록 숨김 처리
- **1단계**: seed 계정 1~2개 제공

### EXHIBITOR (출품자)
- **권한**:
  - 내 부스 생성/수정/제출
  - 내 부스 질문 조회/답변(2단계)
  - 내 부스 통계 조회
- **1단계**: 최소 기능만 제공 (부스는 ADMIN이 등록)
- **2단계**: 온보딩 + 부스 등록 플로우 활성화

### VISITOR (방문자)
- **권한**:
  - 공개 전시/홀/부스 조회
  - 부스별 정책에 따라 질문/방명록 작성
  - 좋아요/북마크 (로그인 필수, 2단계)
- **익명 방문자**:
  - 조회만 가능
  - 게스트 작성이 허용된 부스에 한해 질문/방명록 작성

---

## 권한 체크 규칙

### 1. 전시/홀 관리
| 작업 | ADMIN | EXHIBITOR | VISITOR |
|------|-------|-----------|---------|
| 전시 생성/수정/삭제 | ✅ | ❌ | ❌ |
| 홀 생성/수정/삭제 | ✅ | ❌ | ❌ |
| 공개 전시 조회 | ✅ | ✅ | ✅ (익명 포함) |

### 2. 부스 관리
| 작업 | ADMIN | EXHIBITOR (owner) | EXHIBITOR (타인) | VISITOR |
|------|-------|-------------------|------------------|---------|
| 부스 생성 | ✅ | ✅ (2단계) | ❌ | ❌ |
| 내 부스 수정 | ✅ | ✅ | ❌ | ❌ |
| 타인 부스 수정 | ✅ | ❌ | ❌ | ❌ |
| 부스 제출 | ✅ | ✅ (owner) | ❌ | ❌ |
| 부스 승인 | ✅ | ❌ | ❌ | ❌ |
| 부스 반려 | ✅ | ❌ | ❌ | ❌ |
| 내 부스 아카이브 | ✅ | ✅ (owner) | ❌ | ❌ |
| APPROVED 부스 조회 | ✅ | ✅ | ✅ | ✅ (익명 포함) |
| DRAFT/SUBMITTED 부스 조회 | ✅ | ✅ (owner만) | ❌ | ❌ |

**소유권 체크 로직**:
```java
boolean canModifyBooth(User user, Booth booth) {
    if (user.getRole() == Role.ADMIN) return true;
    if (booth.getOwnerUserId().equals(user.getId())) return true;
    // 2단계: booth_members 체크
    return false;
}
```

### 3. 질문/방명록
| 작업 | 로그인 사용자 | 게스트 (allow_guest_* = true) | 게스트 (allow_guest_* = false) |
|------|--------------|------------------------------|-------------------------------|
| 질문 작성 | ✅ | ✅ | ❌ |
| 방명록 작성 | ✅ | ✅ | ❌ |
| 질문 조회 | ✅ | ✅ | ✅ |
| 방명록 조회 | ✅ | ✅ | ✅ |
| 질문 숨김 | ✅ (ADMIN) | ❌ | ❌ |
| 방명록 숨김 | ✅ (ADMIN) | ❌ | ❌ |

**게스트 작성 허용 조건**:
- `booth.allow_guest_questions = true` (질문)
- `booth.allow_guest_guestbook = true` (방명록)
- 작성 시 `guest_session_id` 필수 (세션당 작성 제한 등 rate limit 적용)

### 4. 트래킹
- 모든 사용자(익명 포함) 가능
- 단, session_id 필수
- rate limit: 1초당 10회 (세션당)

---

## 상태별 조회 권한

### Booth Status별 접근 제어
| Status | ADMIN | Owner | 타 EXHIBITOR | VISITOR |
|--------|-------|-------|--------------|---------|
| DRAFT | ✅ | ✅ | ❌ | ❌ |
| SUBMITTED | ✅ | ✅ | ❌ | ❌ |
| APPROVED | ✅ | ✅ | ✅ | ✅ (익명 포함) |
| REJECTED | ✅ | ✅ | ❌ | ❌ |
| ARCHIVED | ✅ | ✅ | ❌ | ❌ |

---

## Spring Security 적용 방안

### 1. Method Security (권장)
```java
@PreAuthorize("hasRole('ADMIN')")
public void approveBooths(Long boothId) { ... }

@PreAuthorize("hasRole('ADMIN') or @boothSecurityService.isOwner(#boothId, principal)")
public void updateBooth(Long boothId, BoothUpdateDto dto) { ... }

@PreAuthorize("@boothSecurityService.canAccessBooth(#boothId, principal)")
public BoothDetailDto getBooth(Long boothId) { ... }
```

### 2. BoothSecurityService 예시
```java
@Service
public class BoothSecurityService {
    public boolean isOwner(Long boothId, UserPrincipal principal) {
        if (principal == null) return false;
        Booth booth = boothRepository.findById(boothId).orElse(null);
        return booth != null && booth.getOwnerUserId().equals(principal.getId());
    }
    
    public boolean canAccessBooth(Long boothId, UserPrincipal principal) {
        Booth booth = boothRepository.findById(boothId).orElse(null);
        if (booth == null) return false;
        
        // APPROVED는 모두 접근 가능
        if (booth.getStatus() == BoothStatus.APPROVED) return true;
        
        // 그 외는 ADMIN 또는 owner만
        if (principal == null) return false;
        return principal.hasRole("ADMIN") || booth.getOwnerUserId().equals(principal.getId());
    }
}
```

---

## 상태 전이 권한

### Booth Status Transition
| From | To | 필요 권한 | 추가 조건 |
|------|----|---------|----|
| DRAFT | SUBMITTED | Owner or ADMIN | - |
| SUBMITTED | APPROVED | ADMIN | approved_by, approved_at 기록 |
| SUBMITTED | REJECTED | ADMIN | rejected_by, rejected_at, reject_reason 필수 |
| REJECTED | DRAFT | Owner or ADMIN | 수정 후 재제출 가능 |
| APPROVED | ARCHIVED | Owner or ADMIN | archived_by, archived_at 기록 |

**전이 검증 로직**:
```java
public void submitBooth(Long boothId, User user) {
    Booth booth = findBooth(boothId);
    
    // 권한 체크
    if (!isOwner(user, booth) && !isAdmin(user)) {
        throw new AccessDeniedException("권한이 없습니다");
    }
    
    // 상태 전이 체크
    if (booth.getStatus() != BoothStatus.DRAFT) {
        throw new InvalidStateException("DRAFT 상태만 제출 가능합니다");
    }
    
    booth.setStatus(BoothStatus.SUBMITTED);
    booth.setSubmittedAt(Instant.now());
    boothRepository.save(booth);
}
```

---

## Rate Limiting

### 게스트 작성 보호
- **질문/방명록 작성**: 세션당 1시간에 10회
- **트래킹 이벤트**: 세션당 1초에 10회

### 로그인 사용자
- **질문 작성**: 사용자당 1분에 3회
- **방명록 작성**: 사용자당 1분에 5회

### 구현 방안
- Redis + Bucket4j 또는 Spring의 RateLimiter
- IP 기반 글로벌 제한 (DDoS 방지)

---

## 보안 정책

### 1. JWT 토큰
- **Access Token**: 15분 만료, 헤더 전달
- **Refresh Token**: 7일 만료, HttpOnly 쿠키 또는 저장소
- **알고리즘**: HS256 (대칭키) 또는 RS256 (비대칭키)

### 2. 비밀번호
- **해싱**: BCrypt (strength 10~12)
- **정책**: 최소 8자, 영문+숫자 조합 (선택)

### 3. CORS
- 프론트엔드 도메인만 허용
- Credentials: true (쿠키 전송 시)

### 4. XSS/CSRF
- 입력값 검증 및 이스케이프
- CSRF 토큰 (쿠키 기반 인증 시)

---

## 감사(Audit) 로그
다음 작업은 누가/언제 수행했는지 기록:
- 부스 승인/반려 (approved_by, rejected_by)
- 부스 아카이브 (archived_by)
- 질문/방명록 숨김 처리 (2단계: audit_logs 테이블)

---

## 2단계 확장: booth_members
- `booth_members.role`: OWNER, EDITOR, VIEWER
- **OWNER**: 모든 권한 (제출/아카이브 포함)
- **EDITOR**: 부스 내용 수정 가능
- **VIEWER**: 조회만 가능

**권한 체크 확장**:
```java
public boolean canModifyBooth(User user, Booth booth) {
    if (user.getRole() == Role.ADMIN) return true;
    if (booth.getOwnerUserId().equals(user.getId())) return true;
    
    // booth_members 체크
    BoothMember member = boothMemberRepository
        .findByBoothIdAndUserId(booth.getId(), user.getId())
        .orElse(null);
    
    return member != null && 
           (member.getRole() == MemberRole.OWNER || 
            member.getRole() == MemberRole.EDITOR);
}
```


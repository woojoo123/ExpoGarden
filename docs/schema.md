# DB 스키마 상세 명세

## 개요
- **DBMS**: PostgreSQL 14+
- **마이그레이션 도구**: Flyway
- **특징**: jsonb 활용, soft delete, 감사(audit) 필드 포함

---

## 테이블 정의

### 1. users
사용자 계정 (운영자/출품자/방문자)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 사용자 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| password_hash | VARCHAR(255) | NULL | BCrypt 해시 (OAuth 전용 계정은 NULL) |
| role | VARCHAR(20) | NOT NULL | ADMIN, EXHIBITOR, VISITOR |
| nickname | VARCHAR(100) | NOT NULL | 표시 이름 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 시각 |

**인덱스**:
- `idx_users_email` ON (email)
- `idx_users_role` ON (role)

---

### 2. exhibitions
전시/이벤트 단위

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 전시 ID |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL용 슬러그 |
| title | VARCHAR(255) | NOT NULL | 전시 제목 |
| description | TEXT | NULL | 전시 설명 |
| status | VARCHAR(20) | NOT NULL | DRAFT, PUBLISHED, ARCHIVED |
| start_at | TIMESTAMP | NULL | 시작 일시 |
| end_at | TIMESTAMP | NULL | 종료 일시 |
| settings | JSONB | NULL | 전시 단위 설정 (예: 공용 방명록 허용) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**인덱스**:
- `idx_exhibitions_slug` ON (slug)
- `idx_exhibitions_status` ON (status)

**settings 예시**:
```json
{
  "allowGlobalGuestbook": true,
  "theme": "default",
  "maxBoothsPerHall": 50
}
```

---

### 3. halls
전시장 공간 (3D 월드 단위)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 홀 ID |
| exhibition_id | BIGINT | FK(exhibitions), NOT NULL | 소속 전시 |
| name | VARCHAR(255) | NOT NULL | 홀 이름 |
| layout_type | VARCHAR(20) | NOT NULL | GRID, CIRCLE, ROWS |
| layout_config | JSONB | NOT NULL | 레이아웃 파라미터 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**인덱스**:
- `idx_halls_exhibition_id` ON (exhibition_id)

**layout_config 예시**:
```json
// GRID
{
  "type": "GRID",
  "rows": 5,
  "cols": 5,
  "spacing": 10.0,
  "startX": -25.0,
  "startZ": -25.0
}

// CIRCLE
{
  "type": "CIRCLE",
  "radius": 30.0,
  "centerX": 0.0,
  "centerZ": 0.0
}

// ROWS
{
  "type": "ROWS",
  "rowCount": 3,
  "boothsPerRow": 8,
  "rowSpacing": 15.0,
  "boothSpacing": 8.0
}
```

---

### 4. booths
부스 (출품 단위)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 부스 ID |
| exhibition_id | BIGINT | FK(exhibitions), NOT NULL | 소속 전시 |
| hall_id | BIGINT | FK(halls), NOT NULL | 소속 홀 |
| owner_user_id | BIGINT | FK(users), NOT NULL | 소유자 (1단계 기준) |
| status | VARCHAR(20) | NOT NULL | DRAFT, SUBMITTED, APPROVED, REJECTED, ARCHIVED |
| title | VARCHAR(255) | NOT NULL | 부스 제목 |
| summary | VARCHAR(500) | NULL | 짧은 요약 |
| description | TEXT | NULL | 상세 설명 |
| category | VARCHAR(100) | NULL | 카테고리 |
| thumbnail_url | VARCHAR(500) | NULL | 썸네일 이미지 URL |
| tags | JSONB | NULL | 태그 배열 |
| allow_guest_questions | BOOLEAN | NOT NULL, DEFAULT FALSE | 게스트 질문 허용 |
| allow_guest_guestbook | BOOLEAN | NOT NULL, DEFAULT FALSE | 게스트 방명록 허용 |
| submitted_at | TIMESTAMP | NULL | 제출 일시 |
| approved_at | TIMESTAMP | NULL | 승인 일시 |
| approved_by | BIGINT | FK(users), NULL | 승인자 |
| rejected_at | TIMESTAMP | NULL | 반려 일시 |
| rejected_by | BIGINT | FK(users), NULL | 반려자 |
| reject_reason | TEXT | NULL | 반려 사유 |
| archived_at | TIMESTAMP | NULL | 아카이브 일시 |
| archived_by | BIGINT | FK(users), NULL | 아카이브 처리자 |
| pos_override | JSONB | NULL | 좌표 수동 조정 (확장용) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**인덱스**:
- `idx_booths_exhibition_hall_status` ON (exhibition_id, hall_id, status)
- `idx_booths_owner` ON (owner_user_id)
- `idx_booths_status` ON (status)
- `idx_booths_deleted_at` ON (deleted_at) WHERE deleted_at IS NULL

**tags 예시**:
```json
["AI", "IoT", "Smart City"]
```

**pos_override 예시**:
```json
{
  "x": 10.5,
  "y": 0.0,
  "z": -5.2,
  "rotY": 45.0
}
```

---

### 5. booth_media
부스 미디어 (이미지/영상/파일/링크)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 미디어 ID |
| booth_id | BIGINT | FK(booths), NOT NULL | 소속 부스 |
| type | VARCHAR(20) | NOT NULL | IMAGE, VIDEO, FILE, LINK |
| url | VARCHAR(1000) | NOT NULL | 미디어 URL |
| title | VARCHAR(255) | NULL | 미디어 제목/설명 |
| sort_order | INT | NOT NULL, DEFAULT 0 | 정렬 순서 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**인덱스**:
- `idx_booth_media_booth_id` ON (booth_id, sort_order)

---

### 6. questions
부스 Q&A

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 질문 ID |
| booth_id | BIGINT | FK(booths), NOT NULL | 소속 부스 |
| user_id | BIGINT | FK(users), NULL | 작성자 (로그인 시) |
| guest_session_id | VARCHAR(255) | NULL | 게스트 세션 ID |
| content | TEXT | NOT NULL | 질문 내용 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'VISIBLE' | VISIBLE, HIDDEN |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**인덱스**:
- `idx_questions_booth_id` ON (booth_id, created_at DESC)
- `idx_questions_status` ON (status)

**제약**:
- user_id 또는 guest_session_id 중 하나는 반드시 존재

---

### 7. guestbook_entries
방명록

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 방명록 ID |
| booth_id | BIGINT | FK(booths), NULL | 부스별 방명록 |
| exhibition_id | BIGINT | FK(exhibitions), NULL | 전시 공용 방명록 (확장용) |
| user_id | BIGINT | FK(users), NULL | 작성자 (로그인 시) |
| guest_session_id | VARCHAR(255) | NULL | 게스트 세션 ID |
| message | TEXT | NOT NULL | 메시지 내용 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'VISIBLE' | VISIBLE, HIDDEN |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**인덱스**:
- `idx_guestbook_booth_id` ON (booth_id, created_at DESC)
- `idx_guestbook_exhibition_id` ON (exhibition_id, created_at DESC)
- `idx_guestbook_status` ON (status)

**제약**:
- booth_id 또는 exhibition_id 중 하나는 반드시 존재
- user_id 또는 guest_session_id 중 하나는 반드시 존재

---

### 8. visit_events
방문/행동 트래킹 로그

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 이벤트 ID |
| exhibition_id | BIGINT | FK(exhibitions), NOT NULL | 전시 |
| booth_id | BIGINT | FK(booths), NULL | 부스 (공용 공간 이벤트는 NULL) |
| user_id | BIGINT | FK(users), NULL | 사용자 (로그인 시) |
| session_id | VARCHAR(255) | NOT NULL | 세션 ID (익명 추적용) |
| action | VARCHAR(50) | NOT NULL | VIEW, CLICK_LINK, PLAY_VIDEO 등 |
| metadata | JSONB | NULL | 추가 정보 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**인덱스**:
- `idx_visit_events_exhibition_created` ON (exhibition_id, created_at DESC)
- `idx_visit_events_booth_created` ON (booth_id, created_at DESC) WHERE booth_id IS NOT NULL
- `idx_visit_events_session` ON (session_id, created_at DESC)
- `idx_visit_events_action` ON (action, created_at DESC)

**metadata 예시**:
```json
{
  "linkUrl": "https://example.com",
  "videoId": "12345",
  "duration": 120
}
```

---

### 9. booth_members (2단계 확장용)
부스 공동 관리자

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | |
| booth_id | BIGINT | FK(booths), NOT NULL | 부스 |
| user_id | BIGINT | FK(users), NOT NULL | 멤버 |
| role | VARCHAR(20) | NOT NULL | OWNER, EDITOR, VIEWER |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**인덱스**:
- `idx_booth_members_booth_user` ON (booth_id, user_id) UNIQUE
- `idx_booth_members_user` ON (user_id)

---

## 상태 전이 규칙

### Booth Status Workflow
```
[*] → DRAFT
DRAFT → SUBMITTED (owner)
SUBMITTED → APPROVED (ADMIN)
SUBMITTED → REJECTED (ADMIN, reason 필수)
REJECTED → DRAFT (owner, 수정 후 재제출)
APPROVED → ARCHIVED (owner or ADMIN)
```

### Exhibition Status (선택적)
```
DRAFT → PUBLISHED (ADMIN)
PUBLISHED → ARCHIVED (ADMIN)
```

---

## Soft Delete 정책
- `booths`, `questions`, `guestbook_entries`는 `deleted_at` 필드로 soft delete
- 조회 시 기본적으로 `WHERE deleted_at IS NULL` 적용
- 관리자는 삭제된 항목도 조회 가능

---

## Foreign Key Cascade 정책
- `ON DELETE CASCADE`: booth_media, booth_members
- `ON DELETE SET NULL`: booths.approved_by, rejected_by, archived_by
- `ON DELETE RESTRICT`: exhibitions, halls, users (참조되는 동안 삭제 불가)

---

## 성능 최적화
1. **파티셔닝**: visit_events는 월별 파티셔닝 권장 (데이터 증가 시)
2. **집계 테이블**: 일별/시간별 통계용 테이블 분리 (2단계)
3. **캐싱**: exhibitions, halls는 Redis 캐싱 권장


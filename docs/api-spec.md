# API 상세 명세

## 개요
- **Base URL**: `http://localhost:8080/api` (개발 환경)
- **인증**: JWT Bearer Token (헤더: `Authorization: Bearer {token}`)
- **Content-Type**: `application/json`
- **응답 형식**: 통일된 래퍼 또는 직접 반환

---

## 공통 응답 구조

### 성공 응답
```json
{
  "data": { ... },
  "timestamp": "2026-01-05T12:00:00Z"
}
```

### 에러 응답
```json
{
  "error": {
    "code": "BOOTH_NOT_FOUND",
    "message": "부스를 찾을 수 없습니다",
    "details": null
  },
  "timestamp": "2026-01-05T12:00:00Z"
}
```

### HTTP 상태 코드
- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 상태 충돌
- `429 Too Many Requests`: Rate limit 초과
- `500 Internal Server Error`: 서버 오류

---

## 1. 인증/유저 API

### 1.1 회원가입
```
POST /api/auth/signup
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동",
  "role": "VISITOR"
}
```

**Response** (201):
```json
{
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "role": "VISITOR"
  }
}
```

---

### 1.2 로그인
```
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "홍길동",
      "role": "VISITOR"
    }
  }
}
```

---

### 1.3 토큰 갱신
```
POST /api/auth/refresh
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200):
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### 1.4 로그아웃
```
POST /api/auth/logout
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200):
```json
{
  "data": {
    "message": "로그아웃 되었습니다"
  }
}
```

---

### 1.5 내 정보 조회
```
GET /api/me
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "role": "VISITOR",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

## 2. 전시/홀 API (공개)

### 2.1 전시 목록 조회
```
GET /api/exhibitions?status=PUBLISHED&page=0&size=20
```

**Query Parameters**:
- `status` (optional): PUBLISHED (기본값)
- `page` (optional): 페이지 번호 (0부터 시작)
- `size` (optional): 페이지 크기 (기본 20)

**Response** (200):
```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "slug": "tech-expo-2026",
        "title": "테크 엑스포 2026",
        "description": "최신 기술 전시회",
        "status": "PUBLISHED",
        "startAt": "2026-03-01T09:00:00Z",
        "endAt": "2026-03-10T18:00:00Z",
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0
  }
}
```

---

### 2.2 전시 상세 조회
```
GET /api/exhibitions/{id}
```

**Response** (200):
```json
{
  "data": {
    "id": 1,
    "slug": "tech-expo-2026",
    "title": "테크 엑스포 2026",
    "description": "최신 기술을 한눈에 볼 수 있는 전시회입니다.",
    "status": "PUBLISHED",
    "startAt": "2026-03-01T09:00:00Z",
    "endAt": "2026-03-10T18:00:00Z",
    "settings": {
      "allowGlobalGuestbook": true
    },
    "hallCount": 3,
    "boothCount": 45,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-05T00:00:00Z"
  }
}
```

---

### 2.3 전시의 홀 목록 조회
```
GET /api/exhibitions/{exhibitionId}/halls
```

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "exhibitionId": 1,
      "name": "메인 홀",
      "layoutType": "GRID",
      "layoutConfig": {
        "type": "GRID",
        "rows": 5,
        "cols": 5,
        "spacing": 10.0,
        "startX": -25.0,
        "startZ": -25.0
      },
      "boothCount": 20,
      "createdAt": "2026-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "exhibitionId": 1,
      "name": "원형 홀",
      "layoutType": "CIRCLE",
      "layoutConfig": {
        "type": "CIRCLE",
        "radius": 30.0,
        "centerX": 0.0,
        "centerZ": 0.0
      },
      "boothCount": 15,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

## 3. 부스 API (공개)

### 3.1 부스 목록 조회
```
GET /api/booths?exhibitionId=1&hallId=1&status=APPROVED&category=AI&q=검색어&page=0&size=20&sort=createdAt,desc
```

**Query Parameters**:
- `exhibitionId` (optional): 전시 ID
- `hallId` (optional): 홀 ID
- `status` (optional): APPROVED (기본값)
- `category` (optional): 카테고리 필터
- `q` (optional): 제목/설명 검색
- `page`, `size`, `sort`: 페이지네이션

**Response** (200):
```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "exhibitionId": 1,
        "hallId": 1,
        "title": "AI 혁신 부스",
        "summary": "최신 AI 기술을 소개합니다",
        "category": "AI",
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "tags": ["AI", "ML", "딥러닝"],
        "status": "APPROVED",
        "createdAt": "2026-01-02T00:00:00Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0
  }
}
```

---

### 3.2 부스 상세 조회
```
GET /api/booths/{id}
```

**Response** (200):
```json
{
  "data": {
    "id": 1,
    "exhibitionId": 1,
    "hallId": 1,
    "ownerUserId": 2,
    "ownerNickname": "김출품",
    "status": "APPROVED",
    "title": "AI 혁신 부스",
    "summary": "최신 AI 기술을 소개합니다",
    "description": "상세한 설명 내용...",
    "category": "AI",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "tags": ["AI", "ML", "딥러닝"],
    "allowGuestQuestions": false,
    "allowGuestGuestbook": true,
    "media": [
      {
        "id": 1,
        "type": "IMAGE",
        "url": "https://example.com/img1.jpg",
        "title": "제품 이미지",
        "sortOrder": 0
      },
      {
        "id": 2,
        "type": "VIDEO",
        "url": "https://example.com/video.mp4",
        "title": "소개 영상",
        "sortOrder": 1
      }
    ],
    "posOverride": null,
    "approvedAt": "2026-01-03T00:00:00Z",
    "createdAt": "2026-01-02T00:00:00Z",
    "updatedAt": "2026-01-03T00:00:00Z"
  }
}
```

---

## 4. 부스 관리 API (출품자/운영자)

### 4.1 부스 생성
```
POST /api/booths
Authorization: Bearer {token}
Role: EXHIBITOR or ADMIN
```

**Request Body**:
```json
{
  "exhibitionId": 1,
  "hallId": 1,
  "title": "새 부스",
  "summary": "짧은 설명",
  "description": "상세 설명",
  "category": "IoT",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "tags": ["IoT", "스마트홈"],
  "allowGuestQuestions": false,
  "allowGuestGuestbook": true,
  "media": [
    {
      "type": "IMAGE",
      "url": "https://example.com/img1.jpg",
      "title": "이미지 1",
      "sortOrder": 0
    }
  ]
}
```

**Response** (201):
```json
{
  "data": {
    "id": 10,
    "status": "DRAFT",
    "title": "새 부스",
    "createdAt": "2026-01-05T12:00:00Z"
  }
}
```

---

### 4.2 부스 수정
```
PUT /api/booths/{id}
Authorization: Bearer {token}
Role: Owner or ADMIN
```

**Request Body**: (생성과 동일, 단 exhibitionId/hallId는 수정 불가)

**Response** (200):
```json
{
  "data": {
    "id": 10,
    "status": "DRAFT",
    "title": "수정된 부스",
    "updatedAt": "2026-01-05T13:00:00Z"
  }
}
```

---

### 4.3 부스 제출
```
POST /api/booths/{id}/submit
Authorization: Bearer {token}
Role: Owner or ADMIN
```

**Response** (200):
```json
{
  "data": {
    "id": 10,
    "status": "SUBMITTED",
    "submittedAt": "2026-01-05T14:00:00Z"
  }
}
```

---

### 4.4 부스 승인
```
POST /api/booths/{id}/approve
Authorization: Bearer {token}
Role: ADMIN
```

**Response** (200):
```json
{
  "data": {
    "id": 10,
    "status": "APPROVED",
    "approvedAt": "2026-01-05T15:00:00Z",
    "approvedBy": 1
  }
}
```

---

### 4.5 부스 반려
```
POST /api/booths/{id}/reject
Authorization: Bearer {token}
Role: ADMIN
```

**Request Body**:
```json
{
  "reason": "내용이 부적절합니다"
}
```

**Response** (200):
```json
{
  "data": {
    "id": 10,
    "status": "REJECTED",
    "rejectedAt": "2026-01-05T15:00:00Z",
    "rejectedBy": 1,
    "rejectReason": "내용이 부적절합니다"
  }
}
```

---

### 4.6 부스 아카이브
```
POST /api/booths/{id}/archive
Authorization: Bearer {token}
Role: Owner or ADMIN
```

**Response** (200):
```json
{
  "data": {
    "id": 10,
    "status": "ARCHIVED",
    "archivedAt": "2026-01-05T16:00:00Z",
    "archivedBy": 1
  }
}
```

---

## 5. 질문 API

### 5.1 부스 질문 목록 조회
```
GET /api/booths/{boothId}/questions?page=0&size=20
```

**Response** (200):
```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "boothId": 1,
        "userId": 3,
        "userNickname": "방문자1",
        "guestSessionId": null,
        "content": "이 제품은 언제 출시되나요?",
        "status": "VISIBLE",
        "createdAt": "2026-01-04T10:00:00Z"
      },
      {
        "id": 2,
        "boothId": 1,
        "userId": null,
        "userNickname": "게스트",
        "guestSessionId": "sess_abc123",
        "content": "가격이 궁금합니다",
        "status": "VISIBLE",
        "createdAt": "2026-01-04T11:00:00Z"
      }
    ],
    "totalElements": 2,
    "totalPages": 1,
    "size": 20,
    "number": 0
  }
}
```

---

### 5.2 질문 작성
```
POST /api/booths/{boothId}/questions
Authorization: Bearer {token} (선택: booth.allowGuestQuestions=true면 불필요)
```

**Request Body**:
```json
{
  "content": "질문 내용입니다",
  "guestSessionId": "sess_abc123"
}
```
- `guestSessionId`: 게스트 작성 시 필수 (로그인 시 무시됨)

**Response** (201):
```json
{
  "data": {
    "id": 3,
    "boothId": 1,
    "content": "질문 내용입니다",
    "createdAt": "2026-01-05T12:00:00Z"
  }
}
```

---

## 6. 방명록 API

### 6.1 부스 방명록 목록 조회
```
GET /api/booths/{boothId}/guestbook?page=0&size=50
```

**Response** (200):
```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "boothId": 1,
        "userId": 5,
        "userNickname": "이방문",
        "guestSessionId": null,
        "message": "멋진 부스네요!",
        "status": "VISIBLE",
        "createdAt": "2026-01-04T14:00:00Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 50,
    "number": 0
  }
}
```

---

### 6.2 방명록 작성
```
POST /api/booths/{boothId}/guestbook
Authorization: Bearer {token} (선택: booth.allowGuestGuestbook=true면 불필요)
```

**Request Body**:
```json
{
  "message": "좋은 전시 감사합니다!",
  "guestSessionId": "sess_xyz789"
}
```

**Response** (201):
```json
{
  "data": {
    "id": 2,
    "boothId": 1,
    "message": "좋은 전시 감사합니다!",
    "createdAt": "2026-01-05T12:00:00Z"
  }
}
```

---

## 7. 트래킹 API

### 7.1 이벤트 전송
```
POST /api/track
```

**Request Body** (단일 이벤트):
```json
{
  "exhibitionId": 1,
  "boothId": 1,
  "sessionId": "sess_xyz789",
  "action": "VIEW",
  "metadata": {
    "duration": 30
  }
}
```

**Request Body** (배치):
```json
{
  "events": [
    {
      "exhibitionId": 1,
      "boothId": 1,
      "sessionId": "sess_xyz789",
      "action": "VIEW",
      "metadata": null
    },
    {
      "exhibitionId": 1,
      "boothId": 1,
      "sessionId": "sess_xyz789",
      "action": "CLICK_LINK",
      "metadata": {
        "linkUrl": "https://example.com"
      }
    }
  ]
}
```

**Response** (200):
```json
{
  "data": {
    "recorded": 2
  }
}
```

---

## 8. 관리자 API (2단계)

### 8.1 전시 생성
```
POST /api/admin/exhibitions
Authorization: Bearer {token}
Role: ADMIN
```

**Request Body**:
```json
{
  "slug": "new-expo-2026",
  "title": "새 전시",
  "description": "설명",
  "status": "DRAFT",
  "startAt": "2026-06-01T09:00:00Z",
  "endAt": "2026-06-10T18:00:00Z",
  "settings": {}
}
```

**Response** (201): (전시 상세와 동일)

---

### 8.2 홀 생성
```
POST /api/admin/halls
Authorization: Bearer {token}
Role: ADMIN
```

**Request Body**:
```json
{
  "exhibitionId": 1,
  "name": "새 홀",
  "layoutType": "GRID",
  "layoutConfig": {
    "type": "GRID",
    "rows": 4,
    "cols": 4,
    "spacing": 12.0,
    "startX": -18.0,
    "startZ": -18.0
  }
}
```

**Response** (201): (홀 상세와 동일)

---

## Rate Limit 헤더

모든 요청에 대해 다음 헤더 반환:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704448800
```

429 응답 시:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 한도를 초과했습니다",
    "retryAfter": 60
  }
}
```

---

## WebSocket (2단계, 선택)
실시간 방명록/채팅용:
```
ws://localhost:8080/ws/booth/{boothId}
```

연결 시 sessionId 또는 JWT 전달 필요.


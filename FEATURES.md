# ExpoGarden 주요 기능 상세

## 🎯 완성된 전체 워크플로

### 1️⃣ 방문자 (익명)
```
전시장 접속 → 3D 공간 탐색 → 부스 클릭 → 상세 정보 확인
```
- 익명 접근 가능
- 세션 ID로 트래킹
- 게스트 작성 허용 부스에서 질문/방명록 작성 가능

### 2️⃣ 출품자 (EXHIBITOR)
```
회원가입 → 로그인 → 부스 등록 → 미디어 추가 → 제출 
  → (ADMIN 승인) → 전시장 공개 ✨
```

**단계별 상세:**
1. **회원가입** (`/signup`)
   - 이메일/비밀번호 또는 구글 OAuth
   - EXHIBITOR 역할 선택

2. **부스 등록** (`/my/booths/new`)
   - 전시/홀 선택
   - 제목, 설명, 카테고리, 태그 입력
   - 썸네일 업로드 (파일 또는 URL)
   - 미디어 다중 추가 (이미지/비디오/링크)
   - 게스트 작성 허용 설정
   - **상태: DRAFT**

3. **부스 수정** (`/my/booths/:id/edit`)
   - 내용 수정 가능 (DRAFT/REJECTED 상태만)

4. **부스 제출** (`/my/booths`)
   - "제출" 버튼 클릭
   - **상태: DRAFT → SUBMITTED**

5. **승인 대기**
   - ADMIN이 검토

6. **결과 확인**
   - APPROVED: 전시장에 공개
   - REJECTED: 반려 사유 확인 후 수정 가능

### 3️⃣ 관리자 (ADMIN)
```
로그인 → 관리자 대시보드 → SUBMITTED 부스 확인 
  → 승인 또는 반려(사유 입력)
```

**관리자 대시보드** (`/admin/booths`)
- 모든 부스 조회 (상태별 필터)
- **SUBMITTED 부스 승인/반려**
- **반려 시 사유 입력** (출품자에게 전달)
- APPROVED 부스 아카이브
- 부스 미리보기

---

## 🔑 권한 시스템

### Role-Based (전역 역할)
- **ADMIN**: 모든 리소스 관리
- **EXHIBITOR**: 내 부스 CRUD + 제출
- **VISITOR**: 관람 + 상호작용

### Ownership (리소스 소유권)
- 부스 생성자 (`owner_user_id`)
- 수정/제출/아카이브: owner만 가능
- ADMIN은 모든 부스 접근 가능

### Membership (공동 관리자, 2단계)
- **booth_members** 테이블
- **OWNER**: 모든 권한 (멤버 관리 포함)
- **EDITOR**: 부스 수정 가능
- **VIEWER**: 조회만 가능

**권한 체크 순서:**
```
1. ADMIN? → 허용
2. owner_user_id == user.id? → 허용
3. booth_members에 OWNER/EDITOR? → 허용 (수정 시)
4. 거부
```

---

## 🎨 3D 레이아웃 시스템

### 레이아웃 타입

#### 1. GRID (그리드)
```json
{
  "type": "GRID",
  "rows": 5,
  "cols": 5,
  "spacing": 10.0,
  "startX": -25.0,
  "startZ": -25.0
}
```
- 규칙적인 격자 배치
- 대규모 전시에 적합

#### 2. CIRCLE (원형)
```json
{
  "type": "CIRCLE",
  "radius": 30.0,
  "centerX": 0.0,
  "centerZ": 0.0
}
```
- 중앙을 향한 원형 배치
- 특별 전시/프리미엄 부스

#### 3. ROWS (행)
```json
{
  "type": "ROWS",
  "rowCount": 3,
  "boothsPerRow": 8,
  "rowSpacing": 15.0,
  "boothSpacing": 8.0
}
```
- 통로가 있는 행 배치
- 일반 전시회 스타일

### 좌표 오버라이드
부스별로 `pos_override` JSON 설정 시 템플릿 무시하고 수동 배치:
```json
{
  "x": 10.5,
  "y": 0.0,
  "z": -5.2,
  "rotY": 45.0
}
```

---

## 🔐 인증 플로우

### JWT Access + Refresh Token
```
로그인 → Access (15분) + Refresh (7일) 발급
  → Access 만료 시 Refresh로 자동 갱신
  → Refresh 만료 시 재로그인
```

### OAuth 로그인 (구글)
```
1. 사용자가 "구글로 로그인" 클릭
2. 구글 인증 페이지로 이동
3. 구글 계정으로 로그인
4. 백엔드가 사용자 정보 수신
5. DB에 사용자 생성/조회
6. JWT Access + Refresh 발급
7. 프론트엔드로 리다이렉트 (토큰 포함)
8. 프론트엔드가 토큰 저장 + 사용자 정보 조회
```

**장점**: 로그인 방식과 무관하게 동일한 JWT 사용 → 아키텍처 일관성

---

## 📡 API 주요 엔드포인트

### 인증
- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/refresh` - 토큰 갱신
- `GET /me` - 내 정보
- OAuth: `/oauth2/authorization/google`

### 전시/홀
- `GET /exhibitions` - 전시 목록
- `GET /exhibitions/{id}` - 전시 상세
- `GET /exhibitions/{id}/halls` - 홀 목록

### 부스 (공개)
- `GET /booths` - 부스 목록 (필터/검색)
- `GET /booths/{id}` - 부스 상세

### 부스 (관리)
- `POST /booths` - 생성
- `PUT /booths/{id}` - 수정
- `POST /booths/{id}/submit` - 제출
- `POST /booths/{id}/approve` - 승인 (ADMIN)
- `POST /booths/{id}/reject` - 반려 (ADMIN)
- `POST /booths/{id}/archive` - 아카이브

### 멤버 관리
- `GET /booths/{id}/members` - 멤버 목록
- `POST /booths/{id}/members` - 멤버 추가
- `PUT /booths/{id}/members/{userId}` - 역할 변경
- `DELETE /booths/{id}/members/{userId}` - 멤버 제거
- `GET /my/memberships` - 내가 멤버인 부스

### 상호작용
- `GET /booths/{id}/questions` - 질문 목록
- `POST /booths/{id}/questions` - 질문 작성
- `GET /booths/{id}/guestbook` - 방명록 목록
- `POST /booths/{id}/guestbook` - 방명록 작성

### 트래킹
- `POST /track` - 이벤트 트래킹 (배치 지원)

### 파일
- `POST /upload` - 이미지 업로드
- `GET /uploads/{filename}` - 이미지 조회

---

## 🎨 UI/UX 주요 화면

### 메인 화면 (`/`)
- 3D 전시장 렌더링
- 홀 선택 드롭다운
- 부스 자동 배치
- 부스 클릭 → 상세 패널

### 회원가입 (`/signup`)
- 이메일/비밀번호 + 닉네임
- 역할 선택 (EXHIBITOR/VISITOR)

### 내 부스 관리 (`/my/booths`)
- 내가 소유한 부스 목록
- 상태별 색상 구분
- "제출" 버튼 (DRAFT → SUBMITTED)

### 부스 등록/수정 (`/my/booths/new`, `/my/booths/:id/edit`)
- 전시/홀 선택
- 기본 정보 입력
- 썸네일 업로드 (파일 또는 URL)
- 미디어 다중 추가
- 게스트 작성 설정

### 관리자 대시보드 (`/admin/booths`)
- 전체 부스 목록 (상태 필터)
- SUBMITTED 부스 승인/반려
- 반려 사유 입력 모달
- 부스 아카이브

---

## 🛡️ 보안 기능

### 인증/인가
- JWT Access + Refresh Token
- BCrypt 비밀번호 해싱 (strength 12)
- Spring Security Method Security
- OAuth2 통합 (구글)

### 입력 검증
- Bean Validation (`@Valid`, `@NotBlank` 등)
- SQL Injection 방어 (JPA/JPQL)
- XSS 방어 (입력 이스케이프)

### Rate Limiting
- 게스트 질문/방명록: 세션당 제한
- 파일 업로드: 10MB 제한

### 감사 로그
- 부스 승인/반려/아카이브 시 누가/언제 기록
- 상태 변경 이력

---

## 🎓 학습 포인트

이 프로젝트를 통해 배울 수 있는 것들:

### 백엔드
- Spring Boot 3.x + Spring Security
- JWT 인증 구현
- OAuth2 통합
- JPA + PostgreSQL (JSONB 활용)
- Flyway 마이그레이션
- RBAC + 리소스 소유권
- 파일 업로드 처리

### 프론트엔드
- React 18 + TypeScript
- Babylon.js 3D 렌더링
- Zustand 상태 관리
- React Router
- API 클라이언트 (토큰 갱신)
- 복잡한 폼 관리

### 아키텍처
- 다중 전시 확장 설계
- 상태 워크플로 관리
- 권한 시스템 설계
- 3D 데이터 기반 렌더링
- API 계약 설계


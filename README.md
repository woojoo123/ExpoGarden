# ExpoGarden - 메타버스 전시/쇼룸 플랫폼

Babylon.js와 Spring Boot 기반의 메타버스 전시장 플랫폼입니다.

## 📋 프로젝트 개요

**ExpoGarden**은 온라인 전시회를 3D 메타버스 환경에서 개최할 수 있는 플랫폼입니다.
- 운영자는 전시장(Exhibition)과 홀(Hall)을 만들고 부스를 관리합니다
- 출품자는 부스를 등록하고 컨텐츠를 업로드합니다 (2단계)
- 방문자는 익명으로 3D 공간을 탐색하고 부스를 방문할 수 있습니다

## 🎯 주요 기능

### 1단계 (MVP)
- ✅ JWT 기반 인증 시스템 (Access + Refresh Token)
- ✅ 전시(Exhibition) / 홀(Hall) / 부스(Booth) 관리
- ✅ 3D 전시장 렌더링 (Babylon.js)
- ✅ 레이아웃 자동 배치 (GRID / CIRCLE / ROWS)
- ✅ 부스 상태 워크플로 (DRAFT → SUBMITTED → APPROVED/REJECTED → ARCHIVED)
- ✅ 역할 기반 접근 제어 (ADMIN / EXHIBITOR / VISITOR)
- ✅ 익명 방문자 트래킹
- ✅ 질문/방명록 기능 (부스별 게스트 작성 토글)
- ✅ 샘플 데이터 포함

### 2단계 (현재 완성)
- ✅ **booth_members** - 부스 공동 관리자 시스템
  - OWNER / EDITOR / VIEWER 역할
  - 멤버 추가/삭제/역할 변경 API
  - 권한 체크 로직 확장 (소유자 + 멤버십)
- ✅ **OAuth 로그인 (구글)**
  - Spring Security OAuth2 Client
  - JWT 토큰 발급 통합
  - 프론트엔드 OAuth 버튼 + 콜백
- ✅ **EXHIBITOR 전체 워크플로**
  - 회원가입 페이지 (EXHIBITOR/VISITOR)
  - 부스 생성/수정 폼 (미디어 다중 추가)
  - 내 부스 관리 페이지
  - 부스 제출 (DRAFT → SUBMITTED)
- ✅ **관리자 대시보드**
  - 부스 승인/반려 UI
  - 상태별 필터링
  - 반려 사유 입력
  - 아카이브 처리

### 3단계 (향후 확장 가능)
- ⏳ 파일 업로드 (이미지/비디오) - 현재는 URL 입력
- ⏳ 방문 통계 대시보드
- ⏳ 실시간 채팅 (WebSocket)
- ⏳ 고급 3D 모델 로딩 (.glb/.gltf)
- ⏳ 아바타 시스템
- ⏳ 카카오 OAuth 추가

## 🛠 기술 스택

### Backend
- **Java 17** + **Spring Boot 3.2.1**
- **Spring Security** (JWT)
- **PostgreSQL 14+** (JSONB 활용)
- **Flyway** (DB 마이그레이션)
- **JPA/Hibernate**

### Frontend
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Babylon.js 6** (3D 렌더링)
- **Zustand** (상태 관리)
- **Axios** (API 클라이언트)

## 📂 프로젝트 구조

```
ExpoGarden/
├── docs/                    # 설계 문서
│   ├── schema.md           # DB 스키마 상세
│   ├── api-spec.md         # API 명세
│   └── authorization.md    # 권한 설계
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/com/expogarden/
│   │   ├── domain/         # 엔티티
│   │   ├── repository/     # JPA 리포지토리
│   │   ├── service/        # 비즈니스 로직
│   │   ├── controller/     # REST API
│   │   ├── security/       # JWT, RBAC
│   │   ├── dto/            # DTO
│   │   └── config/         # 설정
│   └── src/main/resources/db/migration/  # Flyway 마이그레이션
├── frontend/                # React 프론트엔드
│   ├── src/
│   │   ├── scene/          # Babylon.js 3D 엔진
│   │   ├── components/     # React 컴포넌트
│   │   ├── api/            # API 클라이언트
│   │   ├── state/          # Zustand 스토어
│   │   └── types/          # TypeScript 타입
└── docker-compose.yml       # PostgreSQL 컨테이너
```

## 🚀 빠른 시작

### 1. PostgreSQL 실행
```bash
docker-compose up -d
```

### 2. 백엔드 실행
```bash
cd backend
./gradlew bootRun
```
- 서버: `http://localhost:8080/api`
- Flyway가 자동으로 DB 스키마 + 샘플 데이터 생성

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
- 서버: `http://localhost:5173`

### 4. 접속 및 테스트
1. 브라우저에서 `http://localhost:5173` 접속
2. 샘플 전시장(테크 엑스포 2026) 자동 로드
3. 3D 공간에서 부스 클릭하여 상세 정보 확인
4. 우측 상단 패널에서 로그인:
   - **관리자**: `admin@expogarden.com` / `admin123`
   - **회원가입**: "회원가입" 버튼 클릭 (EXHIBITOR 선택)
   - **구글 로그인**: "구글로 로그인" 버튼 (OAuth 설정 필요)
5. **EXHIBITOR 워크플로**:
   - 로그인 → "내 부스 관리" → "+ 새 부스 등록"
   - 폼 작성 → "등록하기" (DRAFT)
   - "제출" 버튼 → SUBMITTED (승인 대기)
6. **ADMIN 워크플로**:
   - 관리자 로그인 → "관리자 대시보드"
   - SUBMITTED 부스 확인
   - "승인" 또는 "반려" (사유 입력)

## 📖 설계 문서

자세한 내용은 [`docs/`](docs/) 폴더를 참고하세요:
- [DB 스키마 상세](docs/schema.md) - 테이블/컬럼/인덱스/제약조건
- [API 명세](docs/api-spec.md) - 전체 엔드포인트 + 요청/응답 DTO
- [권한 설계](docs/authorization.md) - RBAC + 소유권 + booth_members 체크
- [OAuth 설정 가이드](docs/oauth-setup.md) - 구글 OAuth 연동 방법
- [배포 가이드](docs/deployment.md) - 운영 환경 배포 체크리스트

## 🏗 아키텍처 하이라이트

### 1. Booth 상태 워크플로
```
[*] → DRAFT → SUBMITTED → APPROVED/REJECTED → ARCHIVED
                 ↓
              DRAFT (재제출)
```

### 2. 레이아웃 자동 배치
- **GRID**: rows×cols 그리드 배치
- **CIRCLE**: 원형 배치 (반지름 조정)
- **ROWS**: 행 단위 배치 (전시회 스타일)
- 부스별 `pos_override`로 수동 미세조정 가능

### 3. 권한 모델
- **ADMIN**: 전체 관리 (승인/반려/숨김/통계)
- **EXHIBITOR**: 내 부스 CRUD + 제출 (2단계)
- **VISITOR**: 관람 + 질문/방명록 (정책에 따라)
- 익명 방문자: 조회 + 게스트 작성(부스 설정 시)

## 🔐 보안
- JWT Access Token (15분) + Refresh Token (7일)
- BCrypt 비밀번호 해싱
- CSRF 방어 (쿠키 기반 시)
- CORS 설정 (프론트엔드 도메인만 허용)
- Spring Security Method Security (`@PreAuthorize`)

## 📊 샘플 데이터
`V7__Insert_sample_data.sql`에 포함:
- 1개 전시 (테크 엑스포 2026)
- 3개 홀 (그리드/원형/로우)
- 6개 부스 (AI, IoT, 메타버스, 자율주행, 헬스케어, 클라우드)
- 질문/방명록/방문 이벤트 샘플

## 🧪 테스트
```bash
# 백엔드 테스트
cd backend
./gradlew test

# 프론트엔드 빌드
cd frontend
npm run build
```

## 📝 완성된 기능
### Phase 1 (MVP)
- ✅ 스펙 문서 확정
- ✅ JWT 인증 + Spring Security
- ✅ 전체 도메인 + 마이그레이션 + API
- ✅ 3D 전시장 렌더링 (Babylon.js)
- ✅ 샘플 데이터 + seed 계정

### Phase 2 (확장 완료)
- ✅ **booth_members** - 부스 공동 관리자
- ✅ **OAuth 로그인** - 구글 연동
- ✅ **EXHIBITOR 워크플로** - 회원가입 → 부스 등록 → 제출
- ✅ **부스 생성/수정 폼** - 완전한 CRUD (미디어 다중 추가)
- ✅ **관리자 대시보드** - 승인/반려 완성

## 🎯 완전한 워크플로
```
EXHIBITOR 회원가입 → 부스 등록(DRAFT) → 제출(SUBMITTED) 
  → ADMIN 승인(APPROVED) → 3D 전시장 공개 ✨
```

## 🚀 향후 추가 기능
- [ ] 파일 업로드 서버 (S3/로컬 스토리지)
- [ ] 방문 통계 대시보드
- [ ] 실시간 채팅 (WebSocket)
- [ ] 모바일 반응형
- [ ] 고급 3D 모델 (.glb/.gltf)
- [ ] 아바타 시스템
- [ ] 카카오 OAuth

## 📄 라이선스
MIT

## 👥 기여
이슈와 PR은 언제나 환영합니다!

---

**ExpoGarden** - 메타버스에서 만나는 새로운 전시 경험 🌿


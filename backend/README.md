# ExpoGarden Backend

메타버스 전시/쇼룸 플랫폼 백엔드 API 서버

## 기술 스택
- Java 17
- Spring Boot 3.2.1
- PostgreSQL 14+
- Flyway (DB 마이그레이션)
- JWT Authentication
- Spring Security

## 시작하기

### 1. PostgreSQL 실행
```bash
docker-compose up -d
```

### 2. 애플리케이션 실행
```bash
cd backend
./gradlew bootRun
```

서버는 `http://localhost:8080/api`에서 실행됩니다.

### 3. 기본 ADMIN 계정
- Email: `admin@expogarden.com`
- Password: `admin123`

- Email: `admin2@expogarden.com`
- Password: `admin123`

## API 문서
자세한 API 명세는 [`docs/api-spec.md`](../docs/api-spec.md)를 참고하세요.

## 주요 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/me` - 내 정보

### 전시/홀
- `GET /api/exhibitions` - 전시 목록
- `GET /api/exhibitions/{id}` - 전시 상세
- `GET /api/exhibitions/{id}/halls` - 홀 목록

### 부스
- `GET /api/booths` - 부스 목록 (필터/검색)
- `GET /api/booths/{id}` - 부스 상세
- `POST /api/booths` - 부스 생성 (ADMIN/EXHIBITOR)
- `PUT /api/booths/{id}` - 부스 수정 (owner/ADMIN)
- `POST /api/booths/{id}/submit` - 부스 제출
- `POST /api/booths/{id}/approve` - 부스 승인 (ADMIN)
- `POST /api/booths/{id}/reject` - 부스 반려 (ADMIN)

### 질문/방명록
- `GET /api/booths/{id}/questions` - 질문 목록
- `POST /api/booths/{id}/questions` - 질문 작성
- `GET /api/booths/{id}/guestbook` - 방명록 목록
- `POST /api/booths/{id}/guestbook` - 방명록 작성

### 트래킹
- `POST /api/track` - 이벤트 트래킹

## 데이터베이스 마이그레이션
Flyway가 자동으로 실행됩니다. 마이그레이션 파일은 `src/main/resources/db/migration/`에 있습니다.

## 환경 변수
`application.properties`에서 설정:
- `spring.datasource.url` - DB URL
- `spring.datasource.username` - DB 사용자
- `spring.datasource.password` - DB 비밀번호
- `jwt.secret` - JWT 시크릿 키 (운영 환경에서 변경 필수!)


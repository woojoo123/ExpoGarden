# 배포 가이드

## 개발 환경 실행

### 1. PostgreSQL 시작
```bash
docker-compose up -d
```

### 2. 백엔드 실행
```bash
cd backend
./gradlew bootRun
```

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

---

## 운영 환경 배포

### 백엔드 (Spring Boot)

#### 1. JAR 빌드
```bash
cd backend
./gradlew clean build
```

#### 2. 환경 변수 설정
```bash
export DB_URL=jdbc:postgresql://your-db-host:5432/expogarden
export DB_USERNAME=your-db-user
export DB_PASSWORD=your-db-password
export JWT_SECRET=your-production-secret-key-minimum-256-bits
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 3. 실행
```bash
java -jar build/libs/expogarden-backend-0.0.1-SNAPSHOT.jar
```

### 프론트엔드 (React)

#### 1. 빌드
```bash
cd frontend
npm run build
```

#### 2. Nginx 설정 예시
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 프론트엔드 정적 파일
    location / {
        root /var/www/expogarden/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 프록시
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Docker 배포 (옵션)

### Dockerfile (백엔드)
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### docker-compose (전체)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: expogarden
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/expogarden
      DB_USERNAME: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    image: nginx:alpine
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## 체크리스트

### 배포 전 필수 확인
- [ ] JWT_SECRET 변경 (운영용 강력한 키)
- [ ] DB 비밀번호 변경
- [ ] CORS 설정 (운영 도메인 추가)
- [ ] OAuth 리다이렉트 URI 업데이트
- [ ] 파일 업로드 경로 설정 (S3 또는 영구 스토리지)
- [ ] Actuator 엔드포인트 보호
- [ ] 로그 레벨 조정 (INFO 이상)
- [ ] HTTPS 설정

### 성능 최적화
- [ ] DB 커넥션 풀 설정
- [ ] Redis 캐싱 (전시/홀 데이터)
- [ ] CDN 설정 (정적 파일)
- [ ] Gzip 압축
- [ ] 프론트엔드 코드 스플리팅

### 보안
- [ ] Rate limiting 활성화
- [ ] SQL Injection 방어 (JPA 기본 제공)
- [ ] XSS 방어 (입력 검증)
- [ ] CSRF 토큰 (필요 시)
- [ ] 방화벽 규칙


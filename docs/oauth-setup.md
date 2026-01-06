# OAuth 설정 가이드

## 구글 OAuth 설정

### 1. 구글 클라우드 콘솔 설정
1. https://console.cloud.google.com 접속
2. 프로젝트 생성 또는 선택
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션"
6. 승인된 리디렉션 URI 추가:
   - `http://localhost:8080/api/login/oauth2/code/google`

### 2. 환경 변수 설정
백엔드 실행 시 환경 변수 설정:
```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
```

또는 `application.properties`에서 직접 수정:
```properties
spring.security.oauth2.client.registration.google.client-id=your-google-client-id
spring.security.oauth2.client.registration.google.client-secret=your-google-client-secret
```

### 3. 로그인 플로우
1. 사용자가 "구글로 로그인" 버튼 클릭
2. 구글 로그인 페이지로 이동 (`/api/oauth2/authorization/google`)
3. 사용자가 구글 계정으로 인증
4. 구글이 `/api/login/oauth2/code/google`로 리다이렉트
5. 백엔드가 사용자 정보를 받아 DB에 저장 (또는 조회)
6. JWT Access + Refresh 토큰 발급
7. 프론트엔드 `/oauth/callback`로 리다이렉트 (토큰 포함)
8. 프론트엔드가 토큰 저장 후 메인 페이지로 이동

## 주의사항
- 운영 환경에서는 환경 변수로 관리하세요
- 리다이렉션 URI는 반드시 구글 콘솔에 등록되어야 합니다
- CORS 설정을 확인하세요 (프론트엔드 도메인)


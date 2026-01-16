# OAuth HTTPS 배포 정리 (ExpoGarden)

## 문제 원인
- Google OAuth 리다이렉트 URI가 `http://IP/...`로 생성되어 차단됨.
- Google 정책상 실서비스는 **HTTPS 도메인** + 정확한 Redirect URI 필요.

## 목표
- `https://expogarden.duckdns.org`로 HTTPS 접속 가능
- `/api/oauth2/authorization/google`가 Google 로그인으로 302 리다이렉트
- SPA 라우팅(`/oauth/callback`) 404 방지

---

## 1) 런타임 전용 구성
EC2에서 빌드하지 않고 **로컬 빌드 결과물만 실행**.

생성 파일:
- `docker-compose.runtime.yml`

핵심 구성:
- backend: `java -jar /app/app.jar` 실행
- caddy: 80/443, HTTPS 자동 발급
- postgres: 동일

---

## 2) Caddyfile 설정 (최종)
**/api는 백엔드로**, 나머지는 SPA fallback.

`Caddyfile`
```caddy
expogarden.duckdns.org {
  encode gzip
  handle /api/* {
    reverse_proxy backend:8080
  }

  handle {
    root * /usr/share/caddy
    try_files {path} /index.html
    file_server
  }
}
```

---

## 3) 로컬 빌드
```bash
cd backend
./gradlew bootJar

cd ../frontend
npm install
npm run build
```

---

## 4) EC2로 복사할 파일
- `Caddyfile`
- `docker-compose.runtime.yml`
- `.env`
- `backend/build/libs/app.jar`
- `frontend/dist/`

---

## 5) EC2에서 실행
(EC2는 docker-compose v1 사용)
```bash
cd ~/ExpoGarden
docker-compose -f docker-compose.runtime.yml up -d
```

---

## 6) AWS 보안그룹
인바운드 허용:
- TCP 80
- TCP 443

---

## 7) HTTPS 확인
```bash
curl -I https://expogarden.duckdns.org
```

---

## 8) OAuth 확인
```bash
curl -I https://expogarden.duckdns.org/api/oauth2/authorization/google
```
정상일 때:
- `HTTP/2 302`
- `Location: https://accounts.google.com/...`

---

## 9) Google 콘솔 Redirect URI
등록 값:
```
https://expogarden.duckdns.org/api/login/oauth2/code/google
```

---

## 중간에 해결한 주요 이슈
- Caddyfile이 디렉터리로 잘못 생성되어 컨테이너 실패 → 디렉터리 삭제 후 파일 업로드
- `/api/oauth2/authorization/google`가 index.html 반환 → Caddy 라우팅 순서 및 handle 분리
- HTTPS 인증서 발급 실패 → 443 포트 오픈 후 성공
- `/oauth/callback` 404 → `try_files {path} /index.html`로 SPA fallback

---

## 보안 주의
- URL에 accessToken/refreshToken 노출됨 → 토큰 폐기 권장


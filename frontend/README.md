# ExpoGarden Frontend

메타버스 전시/쇼룸 플랫폼 프론트엔드

## 기술 스택
- React 18
- TypeScript
- Vite
- Babylon.js (3D 렌더링)
- Zustand (상태 관리)
- Axios (API 클라이언트)

## 시작하기

### 1. 의존성 설치
```bash
cd frontend
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

### 3. 빌드
```bash
npm run build
```

## 주요 기능
- 3D 전시장 렌더링 (Babylon.js)
- 레이아웃 자동 배치 (GRID/CIRCLE/ROWS)
- 부스 상세 정보 패널
- 질문/방명록 작성 (예정)
- 익명 방문자 트래킹

## 구조
- `src/scene/` - Babylon.js 3D 엔진 및 레이아웃
- `src/components/` - React 컴포넌트
- `src/api/` - API 클라이언트
- `src/state/` - Zustand 상태 관리
- `src/types/` - TypeScript 타입 정의

## API 연동
백엔드 API는 `http://localhost:8080/api`로 프록시 설정되어 있습니다.


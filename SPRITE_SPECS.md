# 캐릭터 스프라이트 시트 규격 (48×48)

## 📐 스프라이트 시트 규격

### 기본 규격
- **프레임 크기**: 48×48 픽셀
- **방향**: 4방향 (Down, Left, Right, Up)
- **애니메이션 프레임**: 각 방향당 4프레임 (Walk)
- **Idle 프레임**: 각 방향의 첫 번째 프레임을 Idle로 재사용
- **전체 프레임**: 16프레임 (4방향 × 4프레임)

### 스프라이트 시트 레이아웃
```
행(Row) 배열:
Row 0: Down  (프레임 0-3)  ⬇️
Row 1: Left  (프레임 4-7)  ⬅️
Row 2: Right (프레임 8-11) ➡️
Row 3: Up    (프레임 12-15) ⬆️

전체 시트 크기: 192×192 픽셀 (4×4 프레임)
```

## 🧩 필요한 파츠 (투명 PNG)

각 파츠는 **동일한 규격과 레이아웃**을 따라야 합니다.

### 1. body (체형)
- `body_male.png` - 남성 체형
- `body_female.png` - 여성 체형

### 2. hair (헤어스타일)
- `hair_01.png` - 숏컷
- `hair_02.png` - 롱헤어
- `hair_03.png` - 포니테일

### 3. top (상의)
- `top_base.png` - 기본 상의 (밝은 회색/흰색, tint 적용용)

### 4. bottom (하의)
- `bottom_base.png` - 기본 하의 (밝은 회색/흰색, tint 적용용)

### 5. shoes (신발)
- `shoes_base.png` - 기본 신발

## 🎨 색상 시스템

### 피부톤 (body tint)
- Light: `0xffd4a3`
- Medium: `0xd4a574`
- Dark: `0xa67c52`

### 헤어 컬러 (hair tint)
- Black: `0x2d2d2d`
- Brown: `0x8b5a3c`
- Blonde: `0xf4d03f`
- Red: `0xdc3545`
- Blue: `0x3498db`

### 상의 컬러 (top tint)
- Blue: `0x3b82f6`
- Red: `0xef4444`
- Green: `0x10b981`
- Purple: `0x8b5cf6`
- Orange: `0xf59e0b`

### 하의 컬러 (bottom tint)
- Navy: `0x1e3a8a`
- Black: `0x1f2937`
- Brown: `0x92400e`
- Gray: `0x6b7280`

## 📊 조합 가능 수

```
2 (체형) × 3 (헤어스타일) × 5 (헤어색) × 5 (상의색) × 4 (하의색) 
= 600가지 조합
```

## 🖌️ 제작 가이드

### Piskel에서 제작
1. 새 스프라이트 생성: 48×48
2. 프레임 16개 추가
3. 레이어: 
   - 아웃라인 (검정)
   - 베이스 컬러 (밝은 회색 - tint용)
   - 음영
4. 4프레임씩 묶어서 4방향 애니메이션 제작
5. Export → PNG → 투명 배경

### Aseprite에서 제작
1. 새 스프라이트: 192×192 (48×48 × 4×4)
2. 그리드 설정: 48×48
3. 레이어별 작업 (Body, Hair, Top, Bottom, Shoes)
4. 각 레이어를 개별 파일로 Export
5. 옵션: Trim OFF (여백 유지 필수)

## ⚠️ 주의사항

1. **모든 파츠의 캔버스 크기 동일해야 함** (192×192)
2. **프레임 위치 고정** - 머리/몸 위치가 프레임마다 흔들리면 안 됨
3. **투명 배경 필수** - PNG 형식
4. **Trim/Crop 비활성화** - Export 시 여백 자동 제거 끄기
5. **기준점 통일** - 모든 파츠가 같은 위치 기준

## 📁 파일 구조

```
frontend/public/assets/characters/parts/
├── body_male.png       (192×192, 16프레임)
├── body_female.png     (192×192, 16프레임)
├── hair_01.png         (192×192, 16프레임)
├── hair_02.png         (192×192, 16프레임)
├── hair_03.png         (192×192, 16프레임)
├── top_base.png        (192×192, 16프레임)
├── bottom_base.png     (192×192, 16프레임)
└── shoes_base.png      (192×192, 16프레임)
```

## 🚀 임시 리소스

실제 픽셀아트 제작 전, 시스템 테스트용 단순 도형 리소스를 먼저 생성합니다.


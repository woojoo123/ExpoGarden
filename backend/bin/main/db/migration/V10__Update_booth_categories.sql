-- V10__Update_booth_categories.sql
-- 카테고리 통일: 기존 카테고리를 새로운 카테고리 체계로 업데이트

-- AI 카테고리는 그대로 유지
-- UPDATE booths SET category = 'AI' WHERE category = 'AI'; -- 이미 AI이므로 불필요

-- IoT, 클라우드, 블록체인 → 프로그래밍
UPDATE booths SET category = '프로그래밍' WHERE category IN ('IoT', '클라우드', '블록체인');

-- 메타버스, 모빌리티, 헬스케어, 교육, 엔터테인먼트 → 기타
UPDATE booths SET category = '기타' WHERE category IN ('메타버스', '모빌리티', '헬스케어', '교육', '엔터테인먼트');


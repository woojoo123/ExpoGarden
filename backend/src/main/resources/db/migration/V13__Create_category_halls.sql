-- V12__Create_category_halls.sql
-- 카테고리별 홀 생성 및 기존 부스를 카테고리 기준으로 홀에 배치

-- 1. 기존 부스들의 hall_id를 임시로 1번으로 변경 (외래 키 제약 위반 방지)
UPDATE booths SET hall_id = 1 WHERE exhibition_id = 1;

-- 2. 기존 홀 2~9 삭제 (이미 존재할 수 있음)
DELETE FROM halls WHERE id IN (2, 3, 4, 5, 6, 7, 8, 9) AND exhibition_id = 1;

-- 3. 홀 1번의 이름을 'AI'로 변경
UPDATE halls SET name = 'AI', layout_config = '{"type":"GRID","rows":4,"cols":4}' 
WHERE id = 1 AND exhibition_id = 1;

-- 4. 나머지 카테고리별 홀 8개 생성 (이미 있으면 무시)
INSERT INTO halls (id, exhibition_id, name, layout_type, layout_config, created_at, updated_at) VALUES
(2, 1, '게임', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW()),
(3, 1, '아트/디자인', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW()),
(4, 1, '사진/영상', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW()),
(5, 1, '일러스트', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW()),
(6, 1, '음악', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW()),
(7, 1, '3D', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW()),
(8, 1, '프로그래밍', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW()),
(9, 1, '기타', 'GRID', '{"type":"GRID","rows":4,"cols":4}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Hall ID 시퀀스 조정 (다음 ID가 10부터 시작하도록)
SELECT setval('halls_id_seq', 9, true);

-- 4. 기존 부스들의 hall_id를 category 기준으로 업데이트
UPDATE booths SET hall_id = 1 WHERE category = 'AI';
UPDATE booths SET hall_id = 2 WHERE category = '게임';
UPDATE booths SET hall_id = 3 WHERE category = '아트/디자인';
UPDATE booths SET hall_id = 4 WHERE category = '사진/영상';
UPDATE booths SET hall_id = 5 WHERE category = '일러스트';
UPDATE booths SET hall_id = 6 WHERE category = '음악';
UPDATE booths SET hall_id = 7 WHERE category = '3D';
UPDATE booths SET hall_id = 8 WHERE category = '프로그래밍';
UPDATE booths SET hall_id = 9 WHERE category = '기타' OR category IS NULL OR category = '';


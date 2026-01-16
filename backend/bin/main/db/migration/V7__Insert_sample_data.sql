-- V7__Insert_sample_data.sql
-- 샘플 데이터 (개발/테스트용)

-- 샘플 전시
INSERT INTO exhibitions (slug, title, description, status, start_at, end_at, settings) VALUES
('tech-expo-2026', '테크 엑스포 2026', '최신 기술을 한눈에 볼 수 있는 대규모 전시회입니다. AI, IoT, 메타버스 등 다양한 분야의 혁신 기술이 전시됩니다.', 'PUBLISHED', '2026-03-01 09:00:00', '2026-03-10 18:00:00', '{"allowGlobalGuestbook": true, "theme": "tech"}');

-- 샘플 홀
INSERT INTO halls (exhibition_id, name, layout_type, layout_config) VALUES
(1, '메인 홀 (그리드)', 'GRID', '{"type": "GRID", "rows": 5, "cols": 5, "spacing": 10.0, "startX": -25.0, "startZ": -25.0}'),
(1, '원형 홀', 'CIRCLE', '{"type": "CIRCLE", "radius": 30.0, "centerX": 0.0, "centerZ": 0.0}'),
(1, '로우 홀', 'ROWS', '{"type": "ROWS", "rowCount": 3, "boothsPerRow": 8, "rowSpacing": 15.0, "boothSpacing": 8.0}');

-- 샘플 부스 (ADMIN이 등록한 부스들)
INSERT INTO booths (exhibition_id, hall_id, owner_user_id, status, title, summary, description, category, thumbnail_url, tags, allow_guest_questions, allow_guest_guestbook, approved_at, approved_by) VALUES
(1, 1, 1, 'APPROVED', 'AI 혁신 부스', '인공지능의 미래를 만나보세요', '최신 AI 기술과 머신러닝 솔루션을 소개합니다. GPT-4, 이미지 생성 AI, 음성 인식 등 다양한 AI 기술을 체험할 수 있습니다.', 'AI', 'https://picsum.photos/seed/ai/400/300', '["AI", "ML", "딥러닝", "GPT"]', false, true, CURRENT_TIMESTAMP, 1),
(1, 1, 1, 'APPROVED', 'IoT 스마트홈', '집이 똑똑해집니다', 'IoT 기술로 구현한 미래형 스마트홈 시스템입니다. 음성 제어, 자동화, 에너지 절감 등 다양한 기능을 경험하세요.', 'IoT', 'https://picsum.photos/seed/iot/400/300', '["IoT", "스마트홈", "자동화"]', true, true, CURRENT_TIMESTAMP, 1),
(1, 1, 1, 'APPROVED', '메타버스 플랫폼', '새로운 세상으로의 초대', '차세대 메타버스 플랫폼을 체험해보세요. VR/AR 기술과 블록체인이 결합된 혁신적인 가상 세계입니다.', '메타버스', 'https://picsum.photos/seed/metaverse/400/300', '["메타버스", "VR", "AR", "블록체인"]', false, true, CURRENT_TIMESTAMP, 1),
(1, 2, 1, 'APPROVED', '자율주행 자동차', '운전이 필요 없는 미래', '완전 자율주행 기술을 탑재한 전기차입니다. LiDAR, 카메라, AI가 결합되어 안전하고 편리한 이동 경험을 제공합니다.', '모빌리티', 'https://picsum.photos/seed/car/400/300', '["자율주행", "전기차", "모빌리티"]', true, true, CURRENT_TIMESTAMP, 1),
(1, 2, 1, 'APPROVED', '헬스케어 AI', '건강한 삶을 위한 AI', 'AI 기반 건강 모니터링 및 질병 예측 시스템입니다. 웨어러블 기기와 연동하여 실시간 건강 관리를 지원합니다.', '헬스케어', 'https://picsum.photos/seed/health/400/300', '["헬스케어", "AI", "웨어러블"]', false, true, CURRENT_TIMESTAMP, 1),
(1, 3, 1, 'APPROVED', '클라우드 솔루션', '어디서나 접근 가능한 클라우드', '기업을 위한 강력한 클라우드 인프라 솔루션입니다. 확장성, 보안, 비용 효율성을 모두 갖췄습니다.', '클라우드', 'https://picsum.photos/seed/cloud/400/300', '["클라우드", "SaaS", "인프라"]', true, false, CURRENT_TIMESTAMP, 1);

-- 샘플 부스 미디어
INSERT INTO booth_media (booth_id, type, url, title, sort_order) VALUES
(1, 'IMAGE', 'https://picsum.photos/seed/ai1/800/600', 'AI 데모 이미지 1', 0),
(1, 'IMAGE', 'https://picsum.photos/seed/ai2/800/600', 'AI 데모 이미지 2', 1),
(1, 'VIDEO', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '소개 영상', 2),
(1, 'LINK', 'https://example.com/ai-demo', '라이브 데모 체험', 3),
(2, 'IMAGE', 'https://picsum.photos/seed/iot1/800/600', '스마트홈 시스템', 0),
(2, 'VIDEO', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '작동 영상', 1),
(3, 'IMAGE', 'https://picsum.photos/seed/meta1/800/600', '메타버스 월드', 0),
(3, 'IMAGE', 'https://picsum.photos/seed/meta2/800/600', '아바타 커스터마이징', 1);

-- 샘플 질문 (게스트 + 로그인)
INSERT INTO questions (booth_id, user_id, guest_session_id, content, status) VALUES
(1, NULL, 'guest_session_001', '이 AI 기술은 언제 상용화되나요?', 'VISIBLE'),
(1, NULL, 'guest_session_002', '가격은 얼마인가요?', 'VISIBLE'),
(2, 1, NULL, '스마트홈 설치 비용이 궁금합니다', 'VISIBLE'),
(4, NULL, 'guest_session_003', '자율주행 레벨이 몇 단계인가요?', 'VISIBLE');

-- 샘플 방명록
INSERT INTO guestbook_entries (booth_id, user_id, guest_session_id, message, status) VALUES
(1, 1, NULL, '정말 인상적인 AI 기술이네요! 미래가 기대됩니다.', 'VISIBLE'),
(1, NULL, 'guest_session_101', '와... 대박이에요!', 'VISIBLE'),
(2, NULL, 'guest_session_102', '스마트홈 꼭 설치하고 싶어요', 'VISIBLE'),
(3, 1, NULL, '메타버스 정말 신기하네요', 'VISIBLE'),
(4, NULL, 'guest_session_103', '자율주행차 타보고 싶어요', 'VISIBLE');

-- 샘플 방문 이벤트
INSERT INTO visit_events (exhibition_id, booth_id, user_id, session_id, action, metadata) VALUES
(1, 1, NULL, 'guest_session_001', 'VIEW', NULL),
(1, 1, NULL, 'guest_session_001', 'PLAY_VIDEO', '{"videoId": "intro"}'),
(1, 2, NULL, 'guest_session_002', 'VIEW', NULL),
(1, 3, 1, 'user_session_001', 'VIEW', NULL),
(1, 4, NULL, 'guest_session_003', 'VIEW', NULL);


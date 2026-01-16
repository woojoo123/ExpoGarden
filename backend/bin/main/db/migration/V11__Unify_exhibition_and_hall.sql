-- V11__Unify_exhibition_and_hall.sql
-- 단일 전시 운영: 모든 쇼룸을 exhibition_id=1, hall_id=1로 통합

UPDATE booths 
SET exhibition_id = 1, hall_id = 1 
WHERE deleted_at IS NULL;


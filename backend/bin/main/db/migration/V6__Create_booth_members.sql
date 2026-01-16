-- V6__Create_booth_members.sql (2단계 확장용)

CREATE TABLE booth_members (
    id BIGSERIAL PRIMARY KEY,
    booth_id BIGINT NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'EDITOR', 'VIEWER')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booth_id, user_id)
);

CREATE INDEX idx_booth_members_booth_user ON booth_members(booth_id, user_id);
CREATE INDEX idx_booth_members_user ON booth_members(user_id);


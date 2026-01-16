-- V3__Create_booths_and_media.sql

CREATE TABLE booths (
    id BIGSERIAL PRIMARY KEY,
    exhibition_id BIGINT NOT NULL REFERENCES exhibitions(id) ON DELETE RESTRICT,
    hall_id BIGINT NOT NULL REFERENCES halls(id) ON DELETE RESTRICT,
    owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ARCHIVED')),
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500),
    description TEXT,
    category VARCHAR(100),
    thumbnail_url VARCHAR(500),
    tags JSONB,
    allow_guest_questions BOOLEAN NOT NULL DEFAULT FALSE,
    allow_guest_guestbook BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP,
    rejected_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reject_reason TEXT,
    archived_at TIMESTAMP,
    archived_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    pos_override JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_booths_exhibition_hall_status ON booths(exhibition_id, hall_id, status);
CREATE INDEX idx_booths_owner ON booths(owner_user_id);
CREATE INDEX idx_booths_status ON booths(status);
CREATE INDEX idx_booths_deleted_at ON booths(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE booth_media (
    id BIGSERIAL PRIMARY KEY,
    booth_id BIGINT NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('IMAGE', 'VIDEO', 'FILE', 'LINK')),
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booth_media_booth_id ON booth_media(booth_id, sort_order);


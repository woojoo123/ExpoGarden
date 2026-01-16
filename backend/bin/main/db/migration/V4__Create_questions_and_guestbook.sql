-- V4__Create_questions_and_guestbook.sql

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    booth_id BIGINT NOT NULL REFERENCES booths(id) ON DELETE RESTRICT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    guest_session_id VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE' CHECK (status IN ('VISIBLE', 'HIDDEN')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_questions_author CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)
);

CREATE INDEX idx_questions_booth_id ON questions(booth_id, created_at DESC);
CREATE INDEX idx_questions_status ON questions(status);

CREATE TABLE guestbook_entries (
    id BIGSERIAL PRIMARY KEY,
    booth_id BIGINT REFERENCES booths(id) ON DELETE RESTRICT,
    exhibition_id BIGINT REFERENCES exhibitions(id) ON DELETE RESTRICT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    guest_session_id VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE' CHECK (status IN ('VISIBLE', 'HIDDEN')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_guestbook_target CHECK (booth_id IS NOT NULL OR exhibition_id IS NOT NULL),
    CONSTRAINT chk_guestbook_author CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)
);

CREATE INDEX idx_guestbook_booth_id ON guestbook_entries(booth_id, created_at DESC);
CREATE INDEX idx_guestbook_exhibition_id ON guestbook_entries(exhibition_id, created_at DESC);
CREATE INDEX idx_guestbook_status ON guestbook_entries(status);


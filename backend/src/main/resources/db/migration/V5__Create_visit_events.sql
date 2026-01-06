-- V5__Create_visit_events.sql

CREATE TABLE visit_events (
    id BIGSERIAL PRIMARY KEY,
    exhibition_id BIGINT NOT NULL REFERENCES exhibitions(id) ON DELETE RESTRICT,
    booth_id BIGINT REFERENCES booths(id) ON DELETE RESTRICT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visit_events_exhibition_created ON visit_events(exhibition_id, created_at DESC);
CREATE INDEX idx_visit_events_booth_created ON visit_events(booth_id, created_at DESC) WHERE booth_id IS NOT NULL;
CREATE INDEX idx_visit_events_session ON visit_events(session_id, created_at DESC);
CREATE INDEX idx_visit_events_action ON visit_events(action, created_at DESC);


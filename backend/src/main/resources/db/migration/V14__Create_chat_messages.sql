-- V14__Create_chat_messages.sql

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    booth_id BIGINT NOT NULL REFERENCES booths(id) ON DELETE RESTRICT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'CHAT' CHECK (type IN ('CHAT', 'JOIN', 'LEAVE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_booth_id ON chat_messages(booth_id, created_at DESC);

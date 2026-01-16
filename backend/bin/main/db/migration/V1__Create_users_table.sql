-- V1__Create_users_table.sql

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EXHIBITOR', 'VISITOR')),
    nickname VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ADMIN seed 계정 (password: admin123)
INSERT INTO users (email, password_hash, role, nickname) VALUES
('admin@expogarden.com', '$2a$12$coTYlLTcBwg8ERW9njH7qOlyxsJZo.lb6sLn/qmbKYrxGLJdpso7y', 'ADMIN', '관리자'),
('admin2@expogarden.com', '$2a$12$coTYlLTcBwg8ERW9njH7qOlyxsJZo.lb6sLn/qmbKYrxGLJdpso7y', 'ADMIN', '부관리자');


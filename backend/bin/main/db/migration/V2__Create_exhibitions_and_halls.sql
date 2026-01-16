-- V2__Create_exhibitions_and_halls.sql

CREATE TABLE exhibitions (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    settings JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exhibitions_slug ON exhibitions(slug);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);

CREATE TABLE halls (
    id BIGSERIAL PRIMARY KEY,
    exhibition_id BIGINT NOT NULL REFERENCES exhibitions(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    layout_type VARCHAR(20) NOT NULL CHECK (layout_type IN ('GRID', 'CIRCLE', 'ROWS')),
    layout_config JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_halls_exhibition_id ON halls(exhibition_id);


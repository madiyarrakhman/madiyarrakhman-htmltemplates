-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO
    templates (code, name)
VALUES (
        'starry-night',
        'Звездная ночь'
    ) ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid (),
    phone_number VARCHAR(50) NOT NULL,
    template_code VARCHAR(50) REFERENCES templates (code),
    lang VARCHAR(10) DEFAULT 'ru',
    content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsvp_responses (
    id SERIAL PRIMARY KEY,
    invitation_uuid UUID REFERENCES invitations (uuid),
    guest_name VARCHAR(255),
    attendance VARCHAR(10) NOT NULL,
    guest_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS rsvp_responses;

DROP TABLE IF EXISTS invitations;

DROP TABLE IF EXISTS templates;
-- +goose StatementEnd
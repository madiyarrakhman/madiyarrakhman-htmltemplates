-- +goose Up
-- +goose StatementBegin
ALTER TABLE invitations
ADD COLUMN is_paid BOOLEAN DEFAULT false,
ADD COLUMN expires_at TIMESTAMP;

-- Set expiration for existing invitations to far in the future or mark them as paid
UPDATE invitations SET is_paid = true;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE invitations DROP COLUMN is_paid;

ALTER TABLE invitations DROP COLUMN expires_at;
-- +goose StatementEnd
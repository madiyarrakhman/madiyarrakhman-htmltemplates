-- +goose Up
-- +goose StatementBegin
TRUNCATE TABLE invitations CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- No rollback for truncation
-- +goose StatementEnd
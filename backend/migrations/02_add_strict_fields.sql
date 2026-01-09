-- +goose Up
-- +goose StatementBegin
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS groom_name VARCHAR(255);

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS bride_name VARCHAR(255);

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS event_date VARCHAR(100);

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS event_location VARCHAR(255);

-- Update existing records if any
UPDATE invitations SET groom_name = '' WHERE groom_name IS NULL;

UPDATE invitations SET bride_name = '' WHERE bride_name IS NULL;

UPDATE invitations SET event_date = '' WHERE event_date IS NULL;

UPDATE invitations
SET
    event_location = ''
WHERE
    event_location IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE invitations DROP COLUMN IF EXISTS groom_name;

ALTER TABLE invitations DROP COLUMN IF EXISTS bride_name;

ALTER TABLE invitations DROP COLUMN IF EXISTS event_date;

ALTER TABLE invitations DROP COLUMN IF EXISTS event_location;
-- +goose StatementEnd
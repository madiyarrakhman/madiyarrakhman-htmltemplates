-- Migration 02: Add Strict Invitation Fields
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS groom_name VARCHAR(255);

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS bride_name VARCHAR(255);

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS event_date VARCHAR(100);

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS event_location VARCHAR(255);

-- Update existing records if any (set defaults to prevent NULL errors if columns are made NOT NULL later)
UPDATE invitations SET groom_name = '' WHERE groom_name IS NULL;

UPDATE invitations SET bride_name = '' WHERE bride_name IS NULL;

UPDATE invitations SET event_date = '' WHERE event_date IS NULL;

UPDATE invitations
SET
    event_location = ''
WHERE
    event_location IS NULL;

-- Now make them NOT NULL if desired (optional, keeping it safe for now)
-- ALTER TABLE invitations ALTER COLUMN groom_name SET NOT NULL;
-- ALTER TABLE invitations ALTER COLUMN bride_name SET NOT NULL;
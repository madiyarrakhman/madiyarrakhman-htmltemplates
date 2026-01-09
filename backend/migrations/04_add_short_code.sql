-- +goose Up
-- +goose StatementBegin
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS short_code VARCHAR(10) UNIQUE;

-- Function to generate a random short code
CREATE OR REPLACE FUNCTION generate_short_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with short codes
UPDATE invitations
SET
    short_code = generate_short_code ()
WHERE
    short_code IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION IF EXISTS generate_short_code;

ALTER TABLE invitations DROP COLUMN IF EXISTS short_code;
-- +goose StatementEnd
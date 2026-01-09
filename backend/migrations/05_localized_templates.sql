-- +goose Up
-- +goose StatementBegin
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS name_kk VARCHAR(100),
ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);

-- Update existing names
UPDATE templates
SET
    name_en = 'Starry Night',
    name_kk = 'Жұлдызды түн'
WHERE
    code = 'starry-night';

UPDATE templates
SET
    name_en = 'Silk & Ivory',
    name_kk = 'Жібек пен Піл сүйегі'
WHERE
    code = 'silk-ivory';

ALTER TABLE templates RENAME COLUMN name TO name_ru;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE templates RENAME COLUMN name_ru TO name;

ALTER TABLE templates DROP COLUMN IF EXISTS name_kk;

ALTER TABLE templates DROP COLUMN IF EXISTS name_en;
-- +goose StatementEnd
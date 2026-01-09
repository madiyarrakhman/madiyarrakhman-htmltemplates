-- Migration 05: Localized template names
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

-- Re-set name to name_ru explicitly if needed or just keep 'name' as RU
ALTER TABLE templates RENAME COLUMN name TO name_ru;
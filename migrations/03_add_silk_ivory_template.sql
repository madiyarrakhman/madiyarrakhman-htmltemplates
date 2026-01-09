-- Migration 03: Add Silk & Ivory Template
INSERT INTO
    templates (code, name)
VALUES (
        'silk-ivory',
        'Шёлк и Слоновая кость'
    ) ON CONFLICT (code) DO NOTHING;
-- +goose Up
-- +goose StatementBegin
INSERT INTO
    templates (code, name)
VALUES (
        'silk-ivory',
        'Шёлк и Слоновая кость'
    ) ON CONFLICT (code) DO NOTHING;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM templates WHERE code = 'silk-ivory';
-- +goose StatementEnd
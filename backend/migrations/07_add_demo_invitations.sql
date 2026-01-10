-- +goose Up
-- +goose StatementBegin
INSERT INTO
    invitations (
        uuid,
        phone_number,
        template_code,
        lang,
        groom_name,
        bride_name,
        event_date,
        event_location,
        short_code,
        content
    )
VALUES (
        gen_random_uuid (),
        '77011234567',
        'starry-night',
        'ru',
        'Арман',
        'Айгерим',
        '2026-07-15 18:00:00',
        'Rixos Almaty',
        'demo1',
        '{"story": "Наша история началась одним прекрасным летним вечером..."}'
    ),
    (
        gen_random_uuid (),
        '77019876543',
        'silk-ivory',
        'kk',
        'Данияр',
        'Жанар',
        '2026-08-20 17:00:00',
        'Royal Tulip',
        'demo2',
        '{"story": "Бұл махаббат хикаясы..."}'
    ) ON CONFLICT (short_code) DO NOTHING;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM invitations WHERE short_code IN ('demo1', 'demo2');
-- +goose StatementEnd
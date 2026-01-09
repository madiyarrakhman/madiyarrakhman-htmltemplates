Professional API built with TypeScript, following DDD principles for managing wedding invitations, RSVPs, and administrative tasks.

---

## 🛠 Setup & Development (TypeScript)

### Commands
- `npm run build` — Compile TypeScript to `dist/`.
- `npm run dev` — Launch development server with hot-reload (`ts-node`).
- `npm test` — Run Jest unit tests.
- `npm run migrate` — Execute database migrations.
- `npm run generate-keys` — Generate secure API & JWT keys.

---

## 🇺🇸 English Documentation

### 🔐 Authentication

1. **Admin API (Cookies)**: Access to `/api/admin/*` requires login via `/api/admin/login`. On success, the server sets a `admin_token` (HttpOnly cookie).
2. **Public/Integration API (API Key)**: For automated invitation creation, use the header: `x-api-key: <YOUR_PRIVATE_API_KEY>`.

### 📍 Key Endpoints

- `POST /api/invitations` — Create a new invitation (Requires API Key). Returns `fullUrl`.
- `GET /api/invitations/:uuid` — Get invitation data for frontend display.
- `POST /api/rsvp/:uuid` — Save guest response (RSVP).
- `POST /api/admin/login` — Administrator authentication.
- `GET /api/admin/invitations` — List all invitations with RSVP statistics.

---

## 🇷🇺 Русская Документация

### 🔐 Аутентификация

1. **Admin API (Cookies)**: Доступ к `/api/admin/*` требует входа через `/api/admin/login`. При успехе сервер устанавливает куку `admin_token` (HttpOnly).
2. **Public/Integration API (API Key)**: Для автоматического создания приглашений используйте заголовок: `x-api-key: <ВАШ_PRIVATE_API_KEY>`.

### 📍 Основные эндпоинты

- `POST /api/invitations` — Создать новое приглашение (Нужен API Key). Возвращает `fullUrl`.
- `GET /api/invitations/:uuid` — Получить данные приглашения для фронтенда.
- `POST /api/rsvp/:uuid` — Сохранить ответ гостя (RSVP).
- `POST /api/admin/login` — Авторизация администратора.
- `GET /api/admin/invitations` — Список всех приглашений со статистикой RSVP.

---

## 🛠 Usage Example (cURL)

```bash
curl -X POST https://your-domain.app/api/invitations \
  -H "x-api-key: YOUR_PRIVATE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+77012223344",
    "groomName": "Arman",
    "brideName": "Aruzhan",
    "eventDate": "June 15, 2026, 18:00",
    "eventLocation": "Royal Restaurant, Almaty",
    "lang": "ru"
  }'
```

## 🏥 Health Check
`GET /api/health` — Returns system status.

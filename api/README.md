# Wedding RSVP API

Backend API для приема и хранения ответов на приглашение на свадьбу.

## 🚀 Технологии

- **Node.js** + **Express.js** - веб-сервер
- **PostgreSQL** - база данных
- **CORS** - для кросс-доменных запросов

## 📋 API Endpoints

### 1. Health Check
```
GET /api/health
```
Проверка работоспособности API.

**Response:**
```json
{
  "status": "ok",
  "message": "Wedding RSVP API is running"
}
```

### 2. Submit RSVP
```
POST /api/rsvp
```
Отправка ответа на приглашение.

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+7 999 123-45-67",
  "attendance": "yes",
  "guestCount": 2,
  "message": "С радостью придём!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "RSVP submitted successfully",
  "data": {
    "id": 1,
    "guest_name": "Иван Иванов",
    "guest_email": "ivan@example.com",
    "guest_phone": "+7 999 123-45-67",
    "attendance": "yes",
    "guest_count": 2,
    "message": "С радостью придём!",
    "created_at": "2026-01-09T00:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Name, email, and attendance are required fields"
}
```

### 3. Get All RSVPs (Admin)
```
GET /api/rsvp
```
Получить все ответы на приглашение.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "guest_name": "Иван Иванов",
      "guest_email": "ivan@example.com",
      "attendance": "yes",
      "guest_count": 2,
      "created_at": "2026-01-09T00:00:00.000Z"
    }
  ]
}
```

### 4. Get Statistics
```
GET /api/rsvp/stats
```
Получить статистику по ответам.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_responses": 15,
    "attending": 12,
    "not_attending": 3,
    "total_guests": 28
  }
}
```

### 5. Delete RSVP (Admin)
```
DELETE /api/rsvp/:id
```
Удалить ответ по ID.

## 🗄️ Database Schema

```sql
CREATE TABLE rsvp_responses (
    id SERIAL PRIMARY KEY,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    attendance VARCHAR(10) NOT NULL,
    guest_count INTEGER DEFAULT 1,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Setup

1. **Install dependencies:**
```bash
cd api
npm install
```

2. **Create PostgreSQL database:**
```bash
createdb wedding_rsvp
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start server:**
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## 🚀 Deployment on DigitalOcean

### Via App Platform (Recommended)

1. **Push code to GitHub**
2. **Go to DigitalOcean App Platform**
3. **Create App** and select your repository
4. **DigitalOcean will auto-detect** the configuration from `.do/app.yaml`
5. **Add PostgreSQL database** (will be created automatically from config)
6. **Deploy!**

The `DATABASE_URL` environment variable will be automatically populated.

### Manual Database Setup

If you need to set up the database manually:

```bash
# Connect to your DigitalOcean PostgreSQL
psql $DATABASE_URL

# The table will be created automatically on first run
# Or you can create it manually:
CREATE TABLE rsvp_responses (
    id SERIAL PRIMARY KEY,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    attendance VARCHAR(10) NOT NULL,
    guest_count INTEGER DEFAULT 1,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Notes

- Add authentication for admin endpoints in production
- Consider rate limiting to prevent spam
- Validate and sanitize all inputs
- Use HTTPS in production
- Keep dependencies updated

## 📊 Monitoring

Check API health:
```bash
curl https://your-app.ondigitalocean.app/api/health
```

## 🐛 Troubleshooting

**Database connection fails:**
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL is running
- Check firewall/security group settings

**CORS errors:**
- Verify CORS is enabled in `server.js`
- Check allowed origins

**Port already in use:**
- Change `PORT` in `.env`
- Kill process using the port: `lsof -ti:3000 | xargs kill`

## 📝 License

MIT

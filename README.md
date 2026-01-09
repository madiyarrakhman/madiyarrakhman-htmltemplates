# 💍 Wedding Invitation Platform

Professional multi-tenant platform for creating and managing elegant, interactive wedding invitations. Built with Node.js, Express, and PostgreSQL.

[Русская версия (Russian Version)](README_RU.md)

---

## ✨ Overview

This platform allows for the generation of personalized wedding invitations with unique URLs, real-time RSVP tracking, and a powerful admin dashboard.

## 🚀 Key Features

### 🎨 Frontend & Design
- **Premium Templates**: Elegant dark themes, rose-gold accents, and minimal ivory styles.
- **Interactive Elements**: Animated starry backgrounds, floating hearts, and mouse sparkle trails.
- **Full Responsiveness**: Perfect display on mobile, tablet, and desktop.
- **Dynamic Content**: Personalized names, dates, maps, and story sections.

### 🛠️ Backend & API
- **Invitation Engine**: Generate unique UUID-based URLs for every guest/couple.
- **RSVP Tracking**: Real-time guest attendance management and analytics.
- **Admin Dashboard**: Secure panel to create, monitor, and manage invitation batches.
- **Integration Ready**: RESTful API with API Key authentication for automation (e.g., n8n, Zapier).

## 🏗️ Technical Stack

- **Frontend**: Vanilla HTML5, CSS3 (Advanced animations), JavaScript.
- **Backend**: Node.js, TypeScript (Strict Mode).
- **Architecture**: DDD (Domain-Driven Design), Layered Architecture (Domain, Application, Infrastructure).
- **Database**: PostgreSQL (Migrations included).
- **Testing**: Jest (Unit & Integration tests). TDD principles applied.
- **Security**: JWT, Helmet.js, Rate Limiting, XSS Sanitization, HttpOnly Cookies.

## 📦 Project Structure

```
.
├── api/                  # Node.js TypeScript Backend
│   ├── src/              # Source code
│   │   ├── domain/       # Domain Layer (Models & Interfaces)
│   │   ├── application/  # Application Layer (Use Cases)
│   │   └── infrastructure/ # Infrastructure Layer (API, DB, Libs)
│   ├── dist/             # Compiled JS (Generated)
│   └── package.json      # Backend Config
├── admin.html            # Admin Dashboard UI
├── landing.html          # Main landing page
├── wedding-silk-ivory.html # Invitation Template
└── migrations/           # SQL Migration files
```

## 🛠️ Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)

### Steps
1. **Clone the repository**
2. **Install Dependencies**:
   ```bash
   npm install        # Root install
   cd api && npm install # Backend install
   ```
3. **Environment Setup**:
   Create `.env` in the `api/` directory (use `.env.example`).
4. **Database Migrations**:
   ```bash
   npm run migrate
   ```
5. **Build & Launch**:
   ```bash
   npm run build  # Compile TypeScript
   npm start      # Starts on http://localhost:3000
   ```
   *For development:* `npm run dev` (hot-reload with `ts-node`).

## 🔐 Security & Testing

- Run `node api/generate-keys.js` to generate secure keys.
- Refer to `TESTING_CHECKLIST.md` before any production deployment.
- Check `SECURITY.md` for security protocols.

## 📖 Detailed Guides

- [Platform User Guide](PLATFORM_GUIDE.md)
- [API Documentation](api/README.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 📄 License
MIT License.

---
Made with 💝 to make special days even more magical.

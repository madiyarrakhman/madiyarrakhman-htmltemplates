# 💍 Wedding Invitation

Beautiful, modern wedding invitation website with elegant animations and interactive elements.

## ✨ Features

### Frontend
- 🎨 Premium dark theme with rose-gold accents
- ⭐ Animated starry background
- 💫 Smooth scroll animations
- 💝 Floating hearts effect
- ✨ Mouse sparkle trail
- 📱 Fully responsive design
- 🎭 Parallax effects

### Backend API
- 📝 Full RSVP form submission
- 🗄️ PostgreSQL database storage
- 📊 Statistics and analytics endpoints
- ✅ Form validation
- 🔒 Error handling
- 🚀 Ready for production deployment

## 🏗️ Architecture

```
wedding-invitation/
├── Frontend (Static HTML/CSS/JS)
│   ├── wedding-invitation.html
│   ├── styles.css
│   └── script.js
└── Backend API (Node.js + Express)
    ├── server.js
    ├── package.json
    └── PostgreSQL Database
```

## 🚀 Quick Start

### Frontend Only (Static)

1. Open `wedding-invitation.html` directly in your browser, or
2. Use a local server:
   ```bash
   npm install
   npm start
   ```
   Then open http://localhost:3000

### Full Stack (Frontend + Backend + Database)

1. **Setup PostgreSQL:**
   ```bash
   # Install PostgreSQL (macOS)
   brew install postgresql@15
   brew services start postgresql@15
   
   # Create database
   createdb wedding_rsvp
   ```

2. **Configure Backend:**
   ```bash
   cd api
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. **Install & Run:**
   ```bash
   # Install backend dependencies
   cd api
   npm install
   
   # Start backend server
   npm start
   # API will run on http://localhost:3000
   ```

4. **Open Frontend:**
   - Open `wedding-invitation.html` in browser
   - Or use: `npx serve .` from root directory
   - Form submissions will now save to PostgreSQL!

### API Documentation

See [api/README.md](api/README.md) for detailed API documentation.

### Deployment

#### DigitalOcean App Platform (Recommended for Full Stack)

**This will deploy:**
- ✅ Frontend (Static Site)
- ✅ Backend API (Node.js)
- ✅ PostgreSQL Database

**Option 1: Via Web Interface (Easiest)**
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. DigitalOcean will auto-detect the configuration from `.do/app.yaml`
5. It will automatically create:
   - Frontend static site
   - Backend API service
   - PostgreSQL database
6. Click "Next" → "Next" → "Launch App"
7. Your app will be live in ~3-5 minutes!

**Important:** Update `.do/app.yaml` with your GitHub username and repo name:
```yaml
repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
```

**Option 2: Via CLI**
```bash
# Install doctl if you haven't
brew install doctl

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec .do/app.yaml
```

**Pricing:**
- Static Site: Free
- API (basic-xxs): ~$5/month
- PostgreSQL (Dev): ~$7/month
- **Total: ~$12/month**

#### Vercel
```bash
npx vercel
```

#### Netlify
```bash
npx netlify-cli deploy
```

Or simply drag and drop the folder to Vercel/Netlify dashboard.

#### GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select branch and root folder
4. Save

## 📝 Customization

### Edit Content

Open `wedding-invitation.html` and modify:
- **Names**: Lines 27-29 (Анна & Александр)
- **Date**: Line 35 (15 июня 2026)
- **Story**: Lines 50-53
- **Venue**: Lines 67-69
- **Time**: Line 62
- **Timeline**: Lines 90-118

### Change Colors

Open `styles.css` and edit CSS variables (lines 7-17):
```css
--color-primary: hsl(340, 82%, 52%);
--color-secondary: hsl(25, 95%, 63%);
--color-accent: hsl(45, 100%, 70%);
```

### Fonts

Current fonts:
- Display: Cormorant Garamond
- Body: Montserrat

Change in `wedding-invitation.html` (line 9) and `styles.css` (lines 20-21)

## 📁 File Structure

```
.
├── wedding-invitation.html   # Main HTML file
├── styles.css                # All styles and animations
├── script.js                 # Interactive features
├── index.html                # Redirect to main page
├── package.json              # Project metadata
├── vercel.json               # Vercel config
├── netlify.toml              # Netlify config
└── README.md                 # This file
```

## 🎯 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 📧 RSVP Form

The form currently logs data to console. To integrate with a backend:

1. Uncomment lines 42-46 in `script.js`
2. Replace `/api/rsvp` with your endpoint
3. Or use services like:
   - Formspree
   - Google Forms
   - Netlify Forms
   - EmailJS

## 🎨 Design Credits

- Fonts: Google Fonts
- Icons: Unicode symbols
- Color palette: Custom HSL gradients
- Animations: Custom CSS & JavaScript

## 📄 License

MIT License - feel free to use for your own wedding!

---

Made with 💝 for your special day

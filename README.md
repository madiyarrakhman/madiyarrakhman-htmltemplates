# 💍 Wedding Invitation

Beautiful, modern wedding invitation website with elegant animations and interactive elements.

## ✨ Features

- 🎨 Premium dark theme with rose-gold accents
- ⭐ Animated starry background
- 💫 Smooth scroll animations
- 💝 Floating hearts effect
- ✨ Mouse sparkle trail
- 📱 Fully responsive design
- 📝 Interactive RSVP form
- ⏰ Countdown timer
- 🎭 Parallax effects

## 🚀 Quick Start

### Local Development

1. Open `wedding-invitation.html` directly in your browser, or
2. Use a local server:
   ```bash
   npm install
   npm start
   ```
   Then open http://localhost:3000

### Deployment

#### DigitalOcean App Platform (Recommended for this project)

**Option 1: Via Web Interface (Easiest)**
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. DigitalOcean will auto-detect the static site
5. Click "Next" → "Next" → "Launch App"
6. Your app will be live in ~2 minutes!

**Option 2: Via CLI**
```bash
# Install doctl if you haven't
brew install doctl

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec .do/app.yaml
```

**Option 3: Manual Upload**
1. Create a new Static Site on DigitalOcean
2. Upload all files via their interface
3. Set `wedding-invitation.html` as index document

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

# 🔐 Security Setup Guide

This guide explains how to set up API key authentication for the wedding invitation app.

## 🎯 Overview

The app uses two types of API keys:

1. **Public Key** (`pk_...`) - Used by the frontend to submit RSVP forms
   - Can be visible in frontend code
   - Only allows POST requests to submit RSVPs
   - Cannot view or delete existing RSVPs

2. **Private Key** (`sk_...`) - Used for admin operations
   - Must be kept secret
   - Allows viewing all RSVPs, statistics, and deletions
   - Never expose this in frontend code

## 🚀 Setup Instructions

### Step 1: Generate API Keys

Run the key generation script:

```bash
cd api
node generate-keys.js
```

This will:
- Generate secure random keys
- Create a `.env` file with the keys
- Display the keys in the terminal

**Output example:**
```
🔐 Generated API Keys

Add these to your .env file:

PUBLIC_API_KEY=pk_a1b2c3d4e5f6...
PRIVATE_API_KEY=sk_x9y8z7w6v5u4...

⚠️  Keep the PRIVATE_API_KEY secret!
✅ The PUBLIC_API_KEY can be used in frontend code
```

### Step 2: Configure Frontend

1. Copy the config template:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your **PUBLIC** key:
   ```javascript
   const API_CONFIG = {
       PUBLIC_API_KEY: 'pk_your_actual_public_key_here',
       API_URL: window.location.origin + '/api'
   };
   ```

3. **Never commit `config.js` to git** (it's already in `.gitignore`)

### Step 3: Start the Server

```bash
cd api
npm start
```

The server will now require API keys for all requests.

## 🔒 Security Best Practices

### ✅ DO:
- Keep the private key secret
- Use environment variables for keys in production
- Rotate keys if they're compromised
- Use HTTPS in production
- Add rate limiting to prevent abuse

### ❌ DON'T:
- Commit `.env` or `config.js` to git
- Share the private key publicly
- Use the same keys for dev and production
- Hardcode keys in the source code

## 🌐 Production Deployment

### DigitalOcean App Platform

1. **Set Environment Variables:**
   - Go to your app settings
   - Add environment variables:
     - `PUBLIC_API_KEY`: Your public key
     - `PRIVATE_API_KEY`: Your private key

2. **Update Frontend Config:**
   - In DigitalOcean, you can set the public key as a build-time environment variable
   - Or manually update `config.js` after deployment

### Alternative: Use Environment Variables in Frontend

For better security, you can inject the public key at build time:

```javascript
// config.js
const API_CONFIG = {
    PUBLIC_API_KEY: process.env.PUBLIC_API_KEY || 'YOUR_PUBLIC_KEY_HERE',
    API_URL: window.location.origin + '/api'
};
```

## 📋 API Usage Examples

### Submit RSVP (Public Key)

```bash
curl -X POST https://your-app.com/api/rsvp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_your_public_key" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "attendance": "yes",
    "guestCount": 2
  }'
```

### Get All RSVPs (Private Key)

```bash
curl https://your-app.com/api/rsvp \
  -H "X-API-Key: sk_your_private_key"
```

### Get Statistics (Private Key)

```bash
curl https://your-app.com/api/rsvp/stats \
  -H "X-API-Key: sk_your_private_key"
```

## 🔄 Rotating Keys

If you need to rotate your keys:

1. Generate new keys:
   ```bash
   node generate-keys.js
   ```

2. Update `.env` file with new keys

3. Update `config.js` with new public key

4. Restart the server

5. Update production environment variables

## 🐛 Troubleshooting

### "API key is required" error
- Make sure you're sending the `X-API-Key` header
- Check that `config.js` has the correct public key

### "Invalid API key" error
- Verify the key matches the one in `.env`
- Check for extra spaces or characters
- Make sure you're using the right key (public vs private)

### Frontend can't submit forms
- Check browser console for errors
- Verify `config.js` exists and has the public key
- Make sure the API server is running

## 📞 Support

If you encounter issues:
1. Check the server logs
2. Verify environment variables are set
3. Test API endpoints with curl
4. Check CORS settings if using different domains

---

**Remember:** The public key is safe to expose in frontend code, but the private key must always remain secret!

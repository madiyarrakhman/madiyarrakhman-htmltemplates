# 🔐 DigitalOcean Deployment Guide with Secrets

Complete guide for deploying the wedding invitation app on DigitalOcean App Platform with secure API key management.

## 📋 Overview

DigitalOcean App Platform has built-in **encrypted secrets management** (similar to HashiCorp Vault). We'll use it to:
- Store API keys securely
- Automatically inject them during deployment
- Keep them out of git repository

## 🚀 Step-by-Step Deployment

### Step 1: Generate API Keys Locally

First, generate your API keys:

```bash
cd api
node generate-keys.js
```

**Save these keys** - you'll need them in Step 3:
- `PUBLIC_API_KEY`: `pk_...`
- `PRIVATE_API_KEY`: `sk_...`
- `JWT_SECRET`: `(long random string)`

### Step 2: Push Code to GitHub

Make sure all code is pushed:

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### Step 3: Create App on DigitalOcean

1. **Go to** [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)

2. **Click** "Create App"

3. **Select** your GitHub repository:
   - Repository: `madiyarrakhman/madiyarrakhman-htmltemplates`
   - Branch: `main`

4. **DigitalOcean will auto-detect** the configuration from `.do/app.yaml`

5. **Click** "Next"

### Step 4: Add Secrets (IMPORTANT!)

Before launching, you need to add your API keys as **encrypted secrets**:

#### Via Web Interface:

1. **In the App creation wizard**, go to the **"Environment Variables"** section

2. **For the API service**, add:
   
   **PUBLIC_API_KEY:**
   - Key: `PUBLIC_API_KEY`
   - Value: `pk_your_actual_public_key_here`
   - ✅ Check "Encrypt"
   - Scope: Run and Build Time
   
   **PRIVATE_API_KEY:**
   - Key: `PRIVATE_API_KEY`
   - Value: `sk_your_actual_private_key_here`
   - ✅ Check "Encrypt"
   - Scope: Run Time

   **JWT_SECRET:**
   - Key: `JWT_SECRET`
   - Value: `your_generated_jwt_secret_here`
   - ✅ Check "Encrypt"
   - Scope: Run Time

3. **For the Frontend static site**, add:
   
   **PUBLIC_API_KEY:**
   - Key: `PUBLIC_API_KEY`
   - Value: `pk_your_actual_public_key_here`
   - ✅ Check "Encrypt"
   - Scope: Build Time

#### Via CLI (Alternative):

```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml

# Get your app ID
doctl apps list

# Add secrets
doctl apps update YOUR_APP_ID --spec .do/app.yaml

# Or use the web interface to add secrets (easier)
```

### Step 5: Configure Database

The PostgreSQL database will be created automatically. The `DATABASE_URL` will be auto-injected.

### Step 6: Launch App

1. **Review** all settings
2. **Click** "Create Resources"
3. **Wait** 3-5 minutes for deployment

Your app will be available at:
```
https://your-app-name.ondigitalocean.app
```

## 🔒 How Secrets Work in DigitalOcean

### Encryption
- All secrets are **encrypted at rest** using AES-256
- Encrypted in transit with TLS
- Only decrypted at runtime in your app's container

### Access Control
- Secrets are **scoped** to specific components
- `RUN_TIME`: Available when app is running
- `BUILD_TIME`: Available during build process
- `RUN_AND_BUILD_TIME`: Available in both

### Secret Types
```yaml
envs:
  - key: PUBLIC_API_KEY
    scope: RUN_AND_BUILD_TIME
    type: SECRET  # ← This marks it as encrypted
```

## 📸 Screenshots Guide

### Adding Secrets in Web UI:

1. **Navigate to your app** → Settings → Environment Variables

2. **Click** "Edit" next to your component (API or Frontend)

3. **Add environment variable:**
   ```
   Key: PUBLIC_API_KEY
   Value: pk_your_key_here
   [✓] Encrypt
   ```

4. **Click** "Save"

5. **Redeploy** if needed

## 🔄 How It Works

### Backend (API):
```javascript
// In server.js
const publicKey = process.env.PUBLIC_API_KEY;  // ← Injected by DO
const privateKey = process.env.PRIVATE_API_KEY; // ← Injected by DO
```

### Frontend:
```bash
# During build, build.sh runs:
PUBLIC_API_KEY=${PUBLIC_API_KEY} ./build.sh

# This creates config.js with:
const API_CONFIG = {
    PUBLIC_API_KEY: 'pk_...'  // ← Injected during build
};
```

## 🔐 Security Best Practices

### ✅ DO:
- Use DigitalOcean's encrypted secrets
- Rotate keys periodically
- Use different keys for dev/staging/prod
- Monitor access logs

### ❌ DON'T:
- Commit secrets to git
- Share private keys
- Use the same keys across environments
- Log secret values

## 🔄 Updating Secrets

### Via Web Interface:

1. Go to your app → **Settings** → **Environment Variables**
2. Click **"Edit"** next to the variable
3. Update the value
4. Click **"Save"**
5. App will **automatically redeploy**

### Via CLI:

```bash
# Update app spec with new secrets
doctl apps update YOUR_APP_ID --spec .do/app.yaml

# Or update individual env var
doctl apps update YOUR_APP_ID \
  --env PUBLIC_API_KEY=pk_new_key_here
```

## 🔑 Rotating Keys

If you need to rotate your API keys:

1. **Generate new keys locally:**
   ```bash
   cd api
   node generate-keys.js
   ```

2. **Update secrets in DigitalOcean:**
   - Go to App Settings → Environment Variables
   - Update `PUBLIC_API_KEY` and `PRIVATE_API_KEY`
   - Save (app will auto-redeploy)

3. **Done!** No code changes needed.

## 📊 Monitoring Secrets

### View Secret Names (not values):
```bash
doctl apps spec get YOUR_APP_ID
```

### Audit Logs:
- Go to your app → **Activity** tab
- See when secrets were added/updated
- Track deployments triggered by secret changes

## 🐛 Troubleshooting

### "API key is required" error:

**Check:**
1. Secret is added in DigitalOcean
2. Secret name matches exactly: `PUBLIC_API_KEY`
3. Scope is correct (RUN_TIME or BUILD_TIME)
4. App has been redeployed after adding secret

**Debug:**
```bash
# SSH into your app (if enabled)
echo $PUBLIC_API_KEY  # Should show the key

# Check app logs
doctl apps logs YOUR_APP_ID --type=run
```

### Frontend can't submit forms:

**Check:**
1. `build.sh` ran successfully (check build logs)
2. `config.js` was created with the key
3. Public key matches the backend

**View build logs:**
```bash
doctl apps logs YOUR_APP_ID --type=build
```

### Secret not updating:

**Solution:**
1. Update the secret value
2. Manually trigger a redeploy:
   ```bash
   doctl apps create-deployment YOUR_APP_ID
   ```

## 💰 Pricing

Secrets are **included free** with App Platform:
- No extra cost for encrypted secrets
- Unlimited number of secrets
- Included in all tiers

**Total cost:**
- Static Site: Free
- API (basic-xxs): ~$5/month
- PostgreSQL (Dev): ~$7/month
- **Secrets: $0**
- **Total: ~$12/month**

## 📞 Support

### DigitalOcean Documentation:
- [App Platform Secrets](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [Environment Variables](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)

### Community:
- [DigitalOcean Community](https://www.digitalocean.com/community)
- [App Platform Forum](https://www.digitalocean.com/community/tags/app-platform)

---

## 🎯 Quick Reference

### Required Secrets:

| Secret Name | Component | Scope | Description |
|------------|-----------|-------|-------------|
| `PUBLIC_API_KEY` | API | RUN_AND_BUILD_TIME | For RSVP submissions |
| `PRIVATE_API_KEY` | API | RUN_TIME | For admin operations |
| `JWT_SECRET` | API | RUN_TIME | For signing admin JWT tokens |
| `PUBLIC_API_KEY` | Frontend | BUILD_TIME | Injected into config.js |
| `DATABASE_URL` | API | RUN_TIME | Auto-generated by DO |

### Commands Cheat Sheet:

```bash
# List apps
doctl apps list

# Get app details
doctl apps get YOUR_APP_ID

# View logs
doctl apps logs YOUR_APP_ID

# Trigger deployment
doctl apps create-deployment YOUR_APP_ID

# Update app
doctl apps update YOUR_APP_ID --spec .do/app.yaml
```

---

**Remember:** Secrets in DigitalOcean are encrypted and secure. Never commit them to git!

# Quick Deployment Checklist

## Before Deployment

- [ ] Generate API keys: `cd api && node generate-keys.js`
- [ ] Save both keys somewhere safe (password manager)
- [ ] Push code to GitHub: `git push`

## DigitalOcean Setup

### 1. Create App
- [ ] Go to https://cloud.digitalocean.com/apps
- [ ] Click "Create App"
- [ ] Select your GitHub repo
- [ ] Click "Next"

### 2. Add Secrets (CRITICAL!)

Добавьте в **App-Level Environment Variables**:

- [ ] `PUBLIC_API_KEY` (value: `pk_...`)
  - ✅ Check "Encrypt"
  
- [ ] `PRIVATE_API_KEY` (value: `sk_...`)
  - ✅ Check "Encrypt"
  
- [ ] `FRONTEND_PUBLIC_KEY` (value: `pk_...`) ← Тот же ключ!
  - ✅ Check "Encrypt"

⚠️ **Важно:** `FRONTEND_PUBLIC_KEY` должен быть таким же, как `PUBLIC_API_KEY`!

### 3. Launch
- [ ] Review settings
- [ ] Click "Create Resources"
- [ ] Wait 3-5 minutes

### 4. Test
- [ ] Visit your app URL
- [ ] Try submitting RSVP form
- [ ] Check if data saves to database

## Your Keys

**Public Key (для API и Frontend):**
```
pk_e794970a30ba3e1a14a1a72c8bc16be913094a3cc87c2bfa91fc6436b95d661a
```

**Private Key (только для API):**
```
sk_fbc7ee7607d57456f78dc6c5c404f58e2cd6fe7834b03b8332ad6b5237a358ea
```

⚠️ **Keep private key secret!**

### Что добавить в DigitalOcean:

В **App-Level Environment Variables** добавьте **3 переменные**:

1. `PUBLIC_API_KEY` = `pk_e794970a30ba3e1a14a1a72c8bc16be913094a3cc87c2bfa91fc6436b95d661a`
2. `PRIVATE_API_KEY` = `sk_fbc7ee7607d57456f78dc6c5c404f58e2cd6fe7834b03b8332ad6b5237a358ea`
3. `FRONTEND_PUBLIC_KEY` = `pk_e794970a30ba3e1a14a1a72c8bc16be913094a3cc87c2bfa91fc6436b95d661a` (тот же что и PUBLIC_API_KEY)

Все три с галочкой ✅ Encrypt

## Testing Admin Endpoints

After deployment, test with your private key:

```bash
# Get all RSVPs
curl https://your-app.ondigitalocean.app/api/rsvp \
  -H "X-API-Key: sk_fbc7ee7607d57456f78dc6c5c404f58e2cd6fe7834b03b8332ad6b5237a358ea"

# Get statistics
curl https://your-app.ondigitalocean.app/api/rsvp/stats \
  -H "X-API-Key: sk_fbc7ee7607d57456f78dc6c5c404f58e2cd6fe7834b03b8332ad6b5237a358ea"
```

## Troubleshooting

**Form not submitting?**
- Check build logs for `config.js generated` message
- Verify PUBLIC_API_KEY is set in frontend secrets

**API errors?**
- Check API logs: `doctl apps logs YOUR_APP_ID`
- Verify both keys are set in API secrets
- Make sure "Encrypt" is checked

**Database errors?**
- DATABASE_URL should be auto-set
- Check if PostgreSQL database is created

## Need Help?

See detailed guide: [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md)

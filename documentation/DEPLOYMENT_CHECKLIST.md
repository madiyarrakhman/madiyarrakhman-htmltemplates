# Quick Deployment Checklist (Go + Vue)

## Before Deployment

- [ ] Ensure all Go unit tests pass: `cd backend && go test ./...`
- [ ] Ensure Vue frontend builds: `cd frontend && npm run build`
- [ ] Push code to GitHub: `git push`

## DigitalOcean App Platform (Recommended)

### 1. Create App
- [ ] Go to https://cloud.digitalocean.com/apps
- [ ] Click "Create App"
- [ ] Select your GitHub repo
- [ ] **Docker Detection**: DigitalOcean should automatically detect the `Dockerfile` in the root.
- [ ] Set **HTTP Port** to `3008`.

### 2. Add Secrets (CRITICAL!)

Add to **App-Level Environment Variables**:

- [ ] `DATABASE_URL` (usually provided by DO database resource)
- [ ] `JWT_SECRET` (generate a long random string)
- [ ] `ADMIN_USERNAME` (e.g., admin)
- [ ] `ADMIN_PASSWORD` (e.g., your-secure-password)
- [ ] `PRIVATE_API_KEY` (for n8n/Zapier integrations)

### 3. CI/CD with GitHub Actions

The provided `.github/workflows/main.yml` automatically:
1. Runs Go tests.
2. Builds the Vue frontend.
3. Verifies that the Docker image builds successfully.

To enable **Auto-Deployment** to DigitalOcean via GitHub Actions:
1. Uncomment the deploy section in `main.yml`.
2. Add `DIGITALOCEAN_ACCESS_TOKEN` to your GitHub Repo Secrets.

## Troubleshooting

- **Logs**: Use `doctl apps logs <app-id>` to see Go backend output.
- **Port**: Ensure the app is listening on `0.0.0.0:3008` (handled by Dockerfile).
- **Environment**: If `FRONTEND_DIST` is not set, it defaults to `./frontend/dist`.

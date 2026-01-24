# Production Deployment Checklist

Quick reference for deploying Klimat22 with self-hosted Convex.

---

## Two-VPS Architecture

| VPS | Domain | Services |
|-----|--------|----------|
| Backend | `api.klimat22.com` | Convex Backend, Dashboard, Caddy |
| Frontend | `klimat22.com` | Next.js App, Caddy |

---

## Step-by-Step Deployment

### 1. Backend VPS Setup

```bash
# SSH to backend VPS
ssh user@api.klimat22.com

# Create project directory
mkdir -p ~/convex && cd ~/convex

# Create files (copy from guides)
# - docker-compose.yml
# - Caddyfile
# - .env

# Start services
docker compose up -d

# Generate admin key (SAVE THIS!)
docker compose exec backend ./generate_admin_key.sh

# Verify
curl https://api.klimat22.com/version
```

### 2. Set Convex Environment Variables

Either via Convex dashboard or CLI:

```bash
# Required for auth
SITE_URL=https://klimat22.com
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWKS='{"keys":[...]}'
```

Generate JWT keys locally:
```bash
node generateKeys.mjs
```

### 3. Deploy Convex Functions

```bash
# From development machine
export CONVEX_SELF_HOSTED_URL=https://api.klimat22.com
export CONVEX_SELF_HOSTED_ADMIN_KEY=your_admin_key

# Deploy
bunx convex deploy --admin-key $CONVEX_SELF_HOSTED_ADMIN_KEY
```

### 4. Frontend VPS Setup

```bash
# SSH to frontend VPS
ssh user@klimat22.com

# Create project directory
mkdir -p ~/klimat22 && cd ~/klimat22

# Clone/copy your project
git clone your-repo .

# Create .env.production
echo "NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com" > .env.production

# Build and start
docker compose up -d --build

# Verify
curl https://klimat22.com
```

---

## Environment Variables Reference

### Backend VPS (.env)

```bash
# Convex URLs (must be HTTPS production URLs)
CONVEX_CLOUD_ORIGIN=https://api.klimat22.com
CONVEX_SITE_ORIGIN=https://api.klimat22.com
NEXT_PUBLIC_DEPLOYMENT_URL=https://api.klimat22.com

# Logging
RUST_LOG=info
```

### Convex Dashboard (set via CLI or dashboard)

```bash
# Auth configuration
SITE_URL=https://klimat22.com
JWT_PRIVATE_KEY="..."
JWKS='...'

# Optional: enable debug logging
AUTH_LOG_LEVEL=DEBUG
```

### Frontend VPS (.env.production)

```bash
NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com
```

### Build/Deploy (CI/CD)

```bash
CONVEX_SELF_HOSTED_URL=https://api.klimat22.com
CONVEX_SELF_HOSTED_ADMIN_KEY=your_admin_key
```

---

## Verification Checklist

### Backend

- [ ] `curl https://api.klimat22.com/version` returns version
- [ ] Dashboard accessible at `https://dashboard.klimat22.com`
- [ ] Admin key generated and saved
- [ ] JWT keys set in environment
- [ ] SITE_URL set to frontend URL

### Frontend

- [ ] `curl https://klimat22.com` returns HTML
- [ ] Browser can load the site
- [ ] No CORS errors in browser console
- [ ] WebSocket connection established (check Network tab)

### Auth Flow

- [ ] Sign up creates user in database
- [ ] Sign in returns valid token
- [ ] Protected routes redirect to signin
- [ ] Auth state persists across refresh
- [ ] Sign out clears auth state

---

## Common Issues Quick Fixes

### Auth Not Working

1. Check SITE_URL matches frontend domain
2. Check JWT keys are set
3. Check CORS headers in Caddyfile
4. Clear cookies and try again

### WebSocket Disconnects

1. Add `flush_interval -1` to Caddy proxy
2. Remove read/write timeouts
3. Check firewall allows WebSocket upgrade

### CORS Errors

1. Exact origin match (no trailing slash)
2. Credentials header set to `true`
3. OPTIONS handled separately

### 502 Bad Gateway

1. Check container is running: `docker compose ps`
2. Check logs: `docker compose logs backend`
3. Check network: `docker compose exec caddy ping backend`

---

## Backup Commands

```bash
# Backup Convex data
docker compose stop backend
docker run --rm -v convex_convex_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/convex-$(date +%Y%m%d).tar.gz /data
docker compose start backend

# Backup frontend (if using local data)
tar czf frontend-$(date +%Y%m%d).tar.gz ~/klimat22
```

---

## Monitoring

```bash
# Check all containers
docker compose ps

# View logs
docker compose logs -f

# Check resource usage
docker stats

# Check Caddy access logs
docker compose exec caddy cat /data/caddy/logs/access.log | tail -100
```

---

## Rollback

```bash
# Backend - revert to previous image
docker compose down
# Edit docker-compose.yml to use specific version tag
docker compose up -d

# Restore backup
docker compose down
docker volume rm convex_convex_data
docker volume create convex_convex_data
docker run --rm -v convex_convex_data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/convex-YYYYMMDD.tar.gz -C /
docker compose up -d
```

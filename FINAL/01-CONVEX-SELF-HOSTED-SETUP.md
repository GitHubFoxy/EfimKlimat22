# Convex Self-Hosted Setup Guide

Complete guide for deploying self-hosted Convex backend with Docker/Podman and Caddy reverse proxy.

**Source**: [Official Convex Self-Hosting Guide](https://github.com/get-convex/convex-backend/blob/main/self-hosted/README.md)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ VPS 1: Backend (api.klimat22.com)                               │
│                                                                 │
│   Internet → Caddy (:80/:443) → Convex Backend (:3210)          │
│                              → HTTP Actions (:3211)             │
│                              → Dashboard (:6791) [optional]     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ VPS 2: Frontend (klimat22.com)                                  │
│                                                                 │
│   Internet → Caddy (:80/:443) → Next.js App (:3000)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Backend VPS Setup

### Prerequisites

- VPS with 2GB+ RAM
- Docker or Podman installed
- Domain pointing to VPS IP (e.g., `api.klimat22.com`)
- Ports 80 and 443 open

### Step 1: Create Project Directory

```bash
mkdir -p ~/convex-backend && cd ~/convex-backend
```

### Step 2: Create Environment File

Create `.env`:

```bash
# Public URLs (CRITICAL for auth - must match your domain with https)
CONVEX_CLOUD_ORIGIN=https://api.klimat22.com
CONVEX_SITE_ORIGIN=https://api.klimat22.com

# Dashboard URL
NEXT_PUBLIC_DEPLOYMENT_URL=https://api.klimat22.com

# Ports (internal)
PORT=3210
SITE_PROXY_PORT=3211
DASHBOARD_PORT=6791

# Logging
RUST_LOG=info
```

### Step 3: Create docker-compose.yml

```yaml
services:
  backend:
    image: ghcr.io/get-convex/convex-backend:latest
    container_name: convex-backend
    restart: always
    stop_grace_period: 10s
    stop_signal: SIGINT
    expose:
      - "3210"
      - "3211"
    volumes:
      - convex_data:/convex/data
    environment:
      - CONVEX_CLOUD_ORIGIN=${CONVEX_CLOUD_ORIGIN}
      - CONVEX_SITE_ORIGIN=${CONVEX_SITE_ORIGIN}
      - RUST_LOG=${RUST_LOG:-info}
      - DOCUMENT_RETENTION_DELAY=172800
    healthcheck:
      test: curl -f http://localhost:3210/version
      interval: 5s
      start_period: 10s
    networks:
      - convex-net

  dashboard:
    image: ghcr.io/get-convex/convex-dashboard:latest
    container_name: convex-dashboard
    restart: always
    stop_grace_period: 10s
    stop_signal: SIGINT
    expose:
      - "6791"
    environment:
      - NEXT_PUBLIC_DEPLOYMENT_URL=${NEXT_PUBLIC_DEPLOYMENT_URL}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - convex-net

  caddy:
    image: docker.io/library/caddy:alpine
    container_name: convex-caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - backend
      - dashboard
    networks:
      - convex-net

volumes:
  convex_data:
  caddy_data:
  caddy_config:

networks:
  convex-net:
    driver: bridge
```

### Step 4: Create Caddyfile for Backend VPS

```caddyfile
# Main API endpoint
api.klimat22.com {
    # CORS headers for frontend domain
    header {
        Access-Control-Allow-Origin https://klimat22.com
        Access-Control-Allow-Credentials true
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Content-Type, Authorization, Convex-Client, X-Convex-Client"
        Access-Control-Expose-Headers "X-Convex-*"
    }

    # Handle CORS preflight
    @options method OPTIONS
    handle @options {
        respond 204
    }

    # Proxy to Convex backend (WebSocket + HTTP)
    reverse_proxy backend:3210 {
        # Headers for proper proxy identification
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
        
        # WebSocket support (built-in, just ensure no timeout issues)
        flush_interval -1
    }
}

# Dashboard (optional - can be accessed internally only)
dashboard.klimat22.com {
    reverse_proxy dashboard:6791
}
```

### Step 5: Start Services

**Docker:**
```bash
docker compose up -d
```

**Podman:**
```bash
podman-compose up -d

# Or with systemd quadlet (recommended for production)
# See Podman section below
```

### Step 6: Generate Admin Key

```bash
docker compose exec backend ./generate_admin_key.sh
```

**Save this key securely** - you'll need it for:
- `CONVEX_SELF_HOSTED_ADMIN_KEY` in frontend deployment
- Deploying functions via CLI

### Step 7: Verify Installation

```bash
# Check version
curl https://api.klimat22.com/version

# Check health
curl https://api.klimat22.com/health

# Check logs
docker compose logs -f backend
```

---

## Part 2: Podman Alternative

### Using Podman Compose

```bash
# Install podman-compose
pip install podman-compose

# Use the same docker-compose.yml
podman-compose up -d
```

### Using Podman Quadlet (Recommended for Production)

Create systemd unit files in `~/.config/containers/systemd/`:

**convex-backend.container:**
```ini
[Unit]
Description=Convex Backend
After=network-online.target

[Container]
Image=ghcr.io/get-convex/convex-backend:latest
ContainerName=convex-backend
Volume=convex_data:/convex/data
Environment=CONVEX_CLOUD_ORIGIN=https://api.klimat22.com
Environment=CONVEX_SITE_ORIGIN=https://api.klimat22.com
Environment=RUST_LOG=info
PublishPort=3210:3210
PublishPort=3211:3211
HealthCmd=curl -f http://localhost:3210/version
HealthInterval=5s
HealthStartPeriod=10s

[Service]
Restart=always
TimeoutStopSec=10

[Install]
WantedBy=default.target
```

Enable and start:
```bash
systemctl --user daemon-reload
systemctl --user enable --now convex-backend
```

---

## Part 3: Data Persistence & Backup

### SQLite (Default)

Data is stored in `/convex/data` inside the container, mapped to Docker volume `convex_data`.

**Backup:**
```bash
# Docker
docker compose stop backend
docker run --rm -v convex_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/convex-backup-$(date +%Y%m%d).tar.gz /data
docker compose start backend

# Podman
podman stop convex-backend
podman run --rm -v convex_data:/data -v $(pwd):/backup:Z alpine \
  tar czf /backup/convex-backup-$(date +%Y%m%d).tar.gz /data
podman start convex-backend
```

**Restore:**
```bash
docker compose down
docker volume rm convex-backend_convex_data
docker volume create convex-backend_convex_data
docker run --rm -v convex_data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/convex-backup-YYYYMMDD.tar.gz -C /
docker compose up -d
```

### PostgreSQL (Optional - for larger deployments)

Add to environment:
```bash
POSTGRES_URL=postgres://user:pass@postgres-host:5432/convex
```

---

## Part 4: Frontend VPS Environment

On your frontend VPS, set these environment variables:

**.env.local (for development):**
```bash
NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com
```

**.env.production (for deployment):**
```bash
NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com
CONVEX_SELF_HOSTED_URL=https://api.klimat22.com
CONVEX_SELF_HOSTED_ADMIN_KEY=your_admin_key_from_step_6
```

---

## Part 5: Deploy Convex Functions

From your development machine:

```bash
# Set environment
export CONVEX_SELF_HOSTED_URL=https://api.klimat22.com
export CONVEX_SELF_HOSTED_ADMIN_KEY=your_admin_key

# Deploy
bunx convex deploy --admin-key $CONVEX_SELF_HOSTED_ADMIN_KEY
```

---

## Troubleshooting

### WebSocket Connection Issues

1. Ensure Caddy has `flush_interval -1` for WebSocket support
2. Check that `CONVEX_CLOUD_ORIGIN` matches your public URL with `https://`
3. Verify no firewall blocking WebSocket upgrades

### CORS Issues

1. `Access-Control-Allow-Origin` must exactly match frontend domain
2. `Access-Control-Allow-Credentials` must be `true` for auth cookies
3. Cannot use `*` wildcard with credentials

### Container Won't Start

```bash
# Check logs
docker compose logs backend

# Check health
docker compose exec backend curl http://localhost:3210/version
```

### Dashboard Not Loading

Ensure `NEXT_PUBLIC_DEPLOYMENT_URL` points to the **public** backend URL, not internal.

---

## Security Checklist

- [ ] HTTPS enabled via Caddy auto-TLS
- [ ] Admin key stored securely (not in git)
- [ ] Firewall allows only 80/443
- [ ] Regular backups configured
- [ ] Logs monitored for errors

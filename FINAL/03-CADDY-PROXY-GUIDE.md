# Caddy Reverse Proxy Guide

Complete Caddy configuration for proxying Next.js frontend and Convex backend with proper WebSocket, CORS, and cookie support.

**Source**: [Caddy Documentation](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

---

## Overview

Caddy provides:
- Automatic HTTPS with Let's Encrypt
- WebSocket support out of the box
- Simple configuration syntax
- Built-in HTTP/2 and HTTP/3

---

## Part 1: Backend VPS (api.klimat22.com)

### Complete Caddyfile

```caddyfile
# Convex Backend API
api.klimat22.com {
    # ═══════════════════════════════════════════════════════════════
    # CORS Configuration (Critical for cross-origin auth)
    # ═══════════════════════════════════════════════════════════════
    
    header {
        # MUST be exact origin, NOT wildcard, for credentials
        Access-Control-Allow-Origin https://klimat22.com
        
        # Required for cookies/auth tokens
        Access-Control-Allow-Credentials true
        
        # Allowed HTTP methods
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        
        # Allowed request headers
        Access-Control-Allow-Headers "Accept, Authorization, Content-Type, X-Requested-With, Convex-Client, X-Convex-Client, Cookie"
        
        # Headers exposed to JavaScript
        Access-Control-Expose-Headers "Set-Cookie, X-Convex-Client-Id, X-Convex-Auth-Token"
        
        # Cache preflight for 24 hours
        Access-Control-Max-Age "86400"
    }

    # ═══════════════════════════════════════════════════════════════
    # Handle CORS Preflight Requests
    # ═══════════════════════════════════════════════════════════════
    
    @options method OPTIONS
    handle @options {
        respond 204
    }

    # ═══════════════════════════════════════════════════════════════
    # Reverse Proxy to Convex Backend
    # ═══════════════════════════════════════════════════════════════
    
    reverse_proxy backend:3210 {
        # Forward original host
        header_up Host {host}
        
        # Forward client IP
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        
        # Forward protocol (critical for cookie security)
        header_up X-Forwarded-Proto https
        
        # WebSocket: disable buffering for real-time
        flush_interval -1
        
        # Timeouts for long-polling/WebSocket
        transport http {
            dial_timeout 30s
            response_header_timeout 0
            read_timeout 0
            write_timeout 0
        }
    }

    # Logging
    log {
        output file /var/log/caddy/api.log
        format json
    }
}

# HTTP Actions endpoint (if separate)
# Usually same as main API, but if you expose :3211 separately:
# http-actions.klimat22.com {
#     reverse_proxy backend:3211
# }

# Dashboard (optional - restrict access in production)
dashboard.klimat22.com {
    # Basic auth protection (generate hash with: caddy hash-password)
    # basicauth {
    #     admin $2a$14$your_hashed_password
    # }
    
    reverse_proxy dashboard:6791
}
```

---

## Part 2: Frontend VPS (klimat22.com)

### Complete Caddyfile

```caddyfile
# Main site
klimat22.com {
    # Reverse proxy to Next.js
    reverse_proxy app:3000 {
        # Forward headers
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto https
        
        # Support for streaming responses (SSR)
        flush_interval -1
    }

    # Logging
    log {
        output file /var/log/caddy/klimat22.log
        format json
    }
}

# Redirect www to non-www
www.klimat22.com {
    redir https://klimat22.com{uri} permanent
}
```

---

## Part 3: Key Configuration Details

### WebSocket Support

Caddy supports WebSocket automatically. The key settings:

```caddyfile
reverse_proxy backend:3210 {
    # Disable buffering for WebSocket
    flush_interval -1
    
    # No timeouts for persistent connections
    transport http {
        read_timeout 0
        write_timeout 0
    }
}
```

### CORS for Authentication

**Critical Rule**: When using cookies/credentials, you CANNOT use `*` for origin:

```caddyfile
# ✅ CORRECT - exact origin
Access-Control-Allow-Origin https://klimat22.com

# ❌ WRONG - wildcard doesn't work with credentials
Access-Control-Allow-Origin *
```

### Cookie Forwarding

Cookies set by the backend need proper handling:

```caddyfile
header {
    # Expose Set-Cookie header to browser
    Access-Control-Expose-Headers "Set-Cookie"
}
```

### Forwarding Real IP

Important for rate limiting and security:

```caddyfile
reverse_proxy backend:3210 {
    header_up X-Real-IP {remote_host}
    header_up X-Forwarded-For {remote_host}
    header_up X-Forwarded-Proto https
}
```

---

## Part 4: Docker/Podman Integration

### docker-compose.yml with Caddy

```yaml
services:
  app:
    container_name: klimat22-app
    build: .
    expose:
      - "3000"
    environment:
      - NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com
    networks:
      - frontend

  caddy:
    image: docker.io/library/caddy:alpine
    container_name: klimat22-caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app
    networks:
      - frontend

networks:
  frontend:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:
```

### Log Directory Setup

```bash
# Create log directory on host
mkdir -p /var/log/caddy

# Update docker-compose.yml to mount:
volumes:
  - ./Caddyfile:/etc/caddy/Caddyfile:ro
  - caddy_data:/data
  - caddy_config:/config
  - /var/log/caddy:/var/log/caddy
```

---

## Part 5: Troubleshooting

### Issue: 502 Bad Gateway

**Causes:**
- Backend container not running
- Wrong container name in Caddyfile
- Network misconfiguration

**Solutions:**
```bash
# Check backend is running
docker compose ps

# Check network connectivity
docker compose exec caddy ping backend

# Check backend logs
docker compose logs backend
```

### Issue: WebSocket Connection Drops

**Causes:**
- Timeout settings too short
- Buffering enabled

**Solutions:**
```caddyfile
reverse_proxy backend:3210 {
    flush_interval -1
    transport http {
        read_timeout 0
        write_timeout 0
    }
}
```

### Issue: CORS Errors

**Check:**
```bash
# Test preflight
curl -X OPTIONS https://api.klimat22.com \
  -H "Origin: https://klimat22.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see CORS headers in response
```

**Common fixes:**
1. Ensure exact origin match (no trailing slash)
2. Handle OPTIONS method explicitly
3. Include all required headers in `Access-Control-Allow-Headers`

### Issue: Cookies Not Persisting

**Check browser cookies:**
1. DevTools → Application → Cookies
2. Look for `__convexAuth*` cookies
3. Check `SameSite` and `Secure` attributes

**Ensure:**
- Both sites use HTTPS
- `Access-Control-Allow-Credentials: true` is set
- Exact origin (not wildcard) in CORS

### Issue: SSL Certificate Not Working

**Caddy auto-obtains certificates if:**
1. Domain DNS points to server
2. Ports 80 and 443 are open
3. Domain is not localhost

**Check:**
```bash
# Caddy logs
docker compose logs caddy

# Certificate status
curl -v https://api.klimat22.com 2>&1 | grep -A 5 "Server certificate"
```

---

## Part 6: Advanced Configurations

### Rate Limiting

```caddyfile
api.klimat22.com {
    rate_limit {
        zone api {
            key {remote_host}
            events 100
            window 1m
        }
    }
    
    reverse_proxy backend:3210
}
```

### IP Allowlisting for Dashboard

```caddyfile
dashboard.klimat22.com {
    @blocked not remote_ip 1.2.3.4 5.6.7.8
    respond @blocked 403
    
    reverse_proxy dashboard:6791
}
```

### Compression

```caddyfile
klimat22.com {
    encode gzip zstd
    
    reverse_proxy app:3000
}
```

### Custom Error Pages

```caddyfile
klimat22.com {
    handle_errors {
        respond "{err.status_code} {err.status_text}"
    }
    
    reverse_proxy app:3000
}
```

---

## Part 7: Monitoring & Logs

### View Logs

```bash
# Live logs
docker compose logs -f caddy

# JSON log parsing
docker compose exec caddy cat /data/caddy/logs/access.log | jq .
```

### Reload Configuration

```bash
# After editing Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Validate Configuration

```bash
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
```

---

## Quick Reference

### Essential Headers for Convex Auth

| Header | Value | Purpose |
|--------|-------|---------|
| `Access-Control-Allow-Origin` | `https://klimat22.com` | Exact frontend origin |
| `Access-Control-Allow-Credentials` | `true` | Enable cookies |
| `Access-Control-Allow-Methods` | `GET, POST, OPTIONS` | Allowed methods |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization, Convex-Client` | Allowed request headers |
| `Access-Control-Expose-Headers` | `Set-Cookie` | Headers browser can access |

### Essential Proxy Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `flush_interval` | `-1` | Disable buffering for WebSocket |
| `header_up X-Forwarded-Proto` | `https` | Correct protocol detection |
| `read_timeout` | `0` | No timeout for WebSocket |

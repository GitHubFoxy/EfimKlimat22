# Troubleshooting Guide

Solutions for common issues with self-hosted Convex + Next.js + Caddy.

---

## Auth Issues

### Problem: Auth works locally but not in production

**Root Causes & Solutions:**

1. **SITE_URL not set or wrong**
   ```bash
   # Check current value
   bunx convex env list | grep SITE_URL
   
   # Set correct value (frontend URL, not backend)
   bunx convex env set SITE_URL https://klimat22.com
   ```

2. **CONVEX_CLOUD_ORIGIN missing https**
   ```bash
   # In backend .env - MUST include https://
   CONVEX_CLOUD_ORIGIN=https://api.klimat22.com  # ✅
   CONVEX_CLOUD_ORIGIN=api.klimat22.com          # ❌
   ```

3. **JWT keys not deployed**
   ```bash
   # Generate keys
   node generateKeys.mjs
   
   # Set in Convex
   bunx convex env set JWT_PRIVATE_KEY "..."
   bunx convex env set JWKS '...'
   ```

4. **CORS blocking credentials**
   
   In Caddyfile:
   ```caddyfile
   # ❌ WRONG - wildcard doesn't work with credentials
   Access-Control-Allow-Origin *
   
   # ✅ CORRECT - exact origin
   Access-Control-Allow-Origin https://klimat22.com
   ```

---

### Problem: `ctx.auth.getUserIdentity()` returns `null`

**Debugging Steps:**

1. **Check if token is being sent:**
   ```typescript
   // Add to a component
   import { useAuthToken } from '@convex-dev/auth/react';
   
   function Debug() {
     const token = useAuthToken();
     console.log('Token:', token);
     return null;
   }
   ```

2. **Check network tab:**
   - Filter for WebSocket (`WS`)
   - Find `sync` connection
   - Look for `type: "Authenticate"` message
   - If no auth message, token isn't being sent

3. **Enable verbose logging:**
   ```typescript
   // In ConvexClientProvider.tsx
   const convex = new ConvexReactClient(url, { verbose: true });
   ```

4. **Check Convex logs:**
   ```bash
   bunx convex env set AUTH_LOG_LEVEL DEBUG
   # Check dashboard logs
   ```

---

### Problem: Cookies not being set/persisted

**Causes & Solutions:**

1. **Missing HTTPS**
   - Secure cookies require HTTPS
   - Both frontend and backend must use HTTPS

2. **SameSite attribute issue**
   - Cross-site cookies need `SameSite=None; Secure`
   - Caddy needs to expose `Set-Cookie` header:
     ```caddyfile
     Access-Control-Expose-Headers "Set-Cookie"
     ```

3. **Cookie domain mismatch**
   - Check cookie domain in DevTools → Application → Cookies
   - For cross-domain, ensure proper CORS setup

**Clear and retry:**
```javascript
// In browser console
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

### Problem: Redirect loop on protected routes

**Causes:**

1. **Middleware checking auth before client loads**
   
   Use `convexAuth.isAuthenticated()` from context, not hooks:
   ```typescript
   // ❌ WRONG
   const { isAuthenticated } = useConvexAuth();
   
   // ✅ CORRECT - in middleware
   export default convexAuthNextjsMiddleware(
     async (request, { convexAuth }) => {
       const isAuthenticated = await convexAuth.isAuthenticated();
     }
   );
   ```

2. **Wrong route matcher patterns**
   ```typescript
   // Check your matchers
   const isProtectedRoute = createRouteMatcher([
     "/manager(.*)",  // Matches /manager, /manager/*, etc.
   ]);
   ```

---

## Proxy Issues

### Problem: 502 Bad Gateway

**Causes & Solutions:**

1. **Container not running**
   ```bash
   docker compose ps
   # If backend is not running:
   docker compose up -d backend
   docker compose logs backend
   ```

2. **Wrong service name in Caddyfile**
   ```caddyfile
   # Must match container_name or service name
   reverse_proxy backend:3210  # Uses service name
   ```

3. **Network misconfiguration**
   ```bash
   # Check containers are on same network
   docker network ls
   docker network inspect convex_convex-net
   ```

---

### Problem: WebSocket connection fails/drops

**Solutions:**

1. **Add flush_interval to Caddyfile:**
   ```caddyfile
   reverse_proxy backend:3210 {
       flush_interval -1
   }
   ```

2. **Remove timeouts:**
   ```caddyfile
   reverse_proxy backend:3210 {
       transport http {
           read_timeout 0
           write_timeout 0
       }
   }
   ```

3. **Check firewall allows WebSocket upgrade:**
   ```bash
   # Test WebSocket
   curl -i -N \
     -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: test" \
     https://api.klimat22.com/sync
   ```

---

### Problem: CORS errors in browser

**Check CORS headers:**
```bash
curl -X OPTIONS https://api.klimat22.com \
  -H "Origin: https://klimat22.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Required headers in response:**
```
Access-Control-Allow-Origin: https://klimat22.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Convex-Client
Access-Control-Allow-Credentials: true
```

**Common mistakes:**
- Trailing slash in origin: `https://klimat22.com/` ❌
- Wildcard with credentials: `Access-Control-Allow-Origin: *` ❌
- Missing headers in allow list

---

## Container Issues

### Problem: Container keeps restarting

```bash
# Check exit code
docker compose ps

# Check logs
docker compose logs backend

# Common causes:
# - Missing environment variables
# - Port already in use
# - Corrupt data volume
```

**Fix corrupt volume:**
```bash
docker compose down
docker volume rm convex_convex_data
docker compose up -d
# Note: This loses all data - restore from backup
```

---

### Problem: Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean old images
docker image prune -a
```

---

### Problem: High memory usage

```bash
# Check memory
docker stats

# Restart container with memory limit
# In docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

---

## SSL/Certificate Issues

### Problem: Certificate not issued

**Check:**
1. DNS points to server IP
2. Ports 80 and 443 open
3. Domain is valid (not localhost)

```bash
# Check DNS
dig api.klimat22.com

# Check ports
nc -zv your-server-ip 80
nc -zv your-server-ip 443

# Check Caddy logs
docker compose logs caddy | grep -i "certificate\|tls\|acme"
```

---

### Problem: Certificate expired

```bash
# Force renewal
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# Check certificate
echo | openssl s_client -connect api.klimat22.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Data Issues

### Problem: Data not persisting after restart

```bash
# Check volume exists
docker volume ls | grep convex

# Check data directory in container
docker compose exec backend ls -la /convex/data

# Ensure volume is mounted in docker-compose.yml:
volumes:
  - convex_data:/convex/data
```

---

### Problem: Need to restore from backup

```bash
# Stop backend
docker compose stop backend

# Remove current volume
docker volume rm convex_convex_data

# Create new volume
docker volume create convex_convex_data

# Restore backup
docker run --rm \
  -v convex_convex_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/convex-backup.tar.gz -C /

# Start backend
docker compose start backend
```

---

## Debug Commands Cheatsheet

```bash
# Container status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f caddy

# Exec into container
docker compose exec backend /bin/sh
docker compose exec caddy /bin/sh

# Test backend health
curl https://api.klimat22.com/version
curl https://api.klimat22.com/health

# Test CORS
curl -X OPTIONS https://api.klimat22.com \
  -H "Origin: https://klimat22.com" -v

# Check network
docker compose exec caddy ping backend

# Reload Caddy
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# Check SSL
openssl s_client -connect api.klimat22.com:443 < /dev/null

# Monitor resources
docker stats
```

---

## Getting Help

1. **Enable all verbose logging:**
   - Client: `new ConvexReactClient(url, { verbose: true })`
   - Convex: `AUTH_LOG_LEVEL=DEBUG`
   - Middleware: `convexAuthNextjsMiddleware(handler, { verbose: true })`

2. **Collect information:**
   - Browser console errors
   - Network tab (WebSocket messages)
   - Convex dashboard logs
   - Caddy access logs
   - Docker container logs

3. **Resources:**
   - [Convex Discord #self-hosting](https://discord.gg/convex)
   - [Convex Auth Debugging](https://labs.convex.dev/auth/debugging)
   - [Caddy Community](https://caddy.community)

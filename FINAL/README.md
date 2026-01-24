# Klimat22 Production Deployment Guides

Comprehensive guides for deploying self-hosted Convex with Next.js and Caddy.

## Guides

| File | Description |
|------|-------------|
| [01-CONVEX-SELF-HOSTED-SETUP.md](./01-CONVEX-SELF-HOSTED-SETUP.md) | Complete Convex backend deployment with Docker/Podman |
| [02-CONVEX-AUTH-GUIDE.md](./02-CONVEX-AUTH-GUIDE.md) | Authentication setup and troubleshooting |
| [03-CADDY-PROXY-GUIDE.md](./03-CADDY-PROXY-GUIDE.md) | Caddy reverse proxy configuration |
| [04-PRODUCTION-CHECKLIST.md](./04-PRODUCTION-CHECKLIST.md) | Step-by-step deployment checklist |
| [05-TROUBLESHOOTING.md](./05-TROUBLESHOOTING.md) | Common issues and solutions |

## Quick Start

1. **Backend VPS** - Set up Convex backend following Guide 01
2. **Generate JWT Keys** - Follow Guide 02 for auth setup
3. **Configure Caddy** - Apply configurations from Guide 03
4. **Deploy** - Use checklist in Guide 04
5. **Debug** - Reference Guide 05 if issues arise

## Architecture

```
Internet
    │
    ├── klimat22.com (Frontend VPS)
    │   └── Caddy → Next.js App
    │
    └── api.klimat22.com (Backend VPS)
        └── Caddy → Convex Backend + Dashboard
```

## Key Environment Variables

### Backend VPS
```bash
CONVEX_CLOUD_ORIGIN=https://api.klimat22.com
CONVEX_SITE_ORIGIN=https://api.klimat22.com
```

### Convex Environment
```bash
SITE_URL=https://klimat22.com
JWT_PRIVATE_KEY="..."
JWKS='...'
```

### Frontend VPS
```bash
NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com
```

## Sources

- [Convex Self-Hosting Guide](https://github.com/get-convex/convex-backend/blob/main/self-hosted/README.md)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Caddy Documentation](https://caddyserver.com/docs)

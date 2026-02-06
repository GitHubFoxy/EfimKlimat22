# Agents Guide for EfimKlimat22

## Code Philosophy

- Write maintainable, easy-to-understand code. This codebase is reused frequently.
- Prefer simple solutions over complex ones.
- Prefer modules/components over monoliths so patterns are easy to find.

## Workflow Rules

- Use shadcn/ui components when possible for consistency.
- Always run `bun run lint` AND `bun run typecheck` after making changes (do NOT build).
- Use TypeScript strict mode; avoid `any` unless absolutely necessary.
- Do not run `bun dev`; assume a dev server is already running.
- Use `scripts/clone-workdir.sh` to clone the repo with `.env.local` and install deps for testing.

## Verification Workflow

- Use the `agent-browser` skill for browser confirmation tasks:
  - checkout flows
  - UI regressions
  - interactive validation
- Browser automation baseline:
  1. `agent-browser open <url>`
  2. `agent-browser snapshot -i`
  3. `agent-browser click @eX` / `agent-browser fill @eY "text"`
  4. re-run `snapshot -i` after page changes
- Store browser artifacts in `/tmp` when possible.
- Do not leave temporary evidence files tracked in the repository.

## Project Notes

- Document required environment variables (Convex/Auth/URLs) when adding or changing configuration.
- Keep manager/admin workflows explicit and documented when expanding `/app/manager` features.
- Prefer Convex-side validation for checkout/cart/order flows in addition to client checks.
- When deploying to the VPS (`klimat22`), sync from this repo, install `pnpm`/`pm2` in `$HOME/.local`, build with `pnpm exec next build`, then run a single `pm2` process named `klimat22-app` on port `3000`. Host-level routing is handled via the custom Caddy service (reverse proxy `klimat22.com`/`www.klimat22.com` to `127.0.0.1:3000`, let Caddy manage TLS).

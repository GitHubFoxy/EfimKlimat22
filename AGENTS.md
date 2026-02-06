# Agents Guide for EfimKlimat22

## Code Philosophy

Write maintanalbe code, that is easy to understand, this codebase will be used again and again, so make sure code you are proposing is good.
Simple over complex
Modules, Components over Monolith - easy to read each file and find patterns

Use shadcn/ui components when possible for consistency
Always run `bun run lint` AND `bun run typecheck` after making changes (do NOT build)
Use TypeScript strict mode - avoid `any` unless necessary
Do not run bun dev - assume dev server is already running
Use `scripts/clone-workdir.sh` to clone the repo with `.env.local` and install deps for testing.

## Project Notes

Document required environment variables (Convex/Auth/URLs) when adding or changing configuration.
Keep manager/admin workflows explicit and documented when expanding `/app/manager` features.
Prefer Convex-side validation for checkout/cart/order flows in addition to client checks.

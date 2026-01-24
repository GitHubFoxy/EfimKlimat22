# Agents Guide for EfimKlimat22

## Code Philosophy

Write maintanalbe code, that is easy to understand, this codebase will be used again and again, so make sure code you are proposing is good.
Simple over complex
Modules, Components over Monolith - easy to read each file and find patterns

Use shadcn/ui components when possible for consistency
Always run `bun run lint` AND `bun run typecheck` after making changes (do NOT build)
Use TypeScript strict mode - avoid `any` unless necessary
Do not run bun dev - assume dev server is already running



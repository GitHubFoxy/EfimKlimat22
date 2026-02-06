# TODO

## Now
- [ ] Document required env vars and deployment steps in README (Convex/Auth/URLs, prod DB usage).
- [x] Verify prod Convex deployment is connected (env + Convex URLs) and app points to prod DB.
- [ ] Remove/disable VTB online payments from checkout UI and backend flow.
- [ ] Run `bun run lint` and `bun run typecheck`, fix issues.

## Next
- [ ] Review catalog queries for scalability; reduce in-memory sorting or document limits.
- [ ] Add server-side validation for checkout/cart/order flows in Convex.
- [ ] Review manager/admin workflows for completeness and document expected actions.

## Later
- [ ] Add production monitoring/alerting checklist (Convex logs, error tracking).
- [ ] Add smoke test checklist for deployment (critical pages + checkout flow).

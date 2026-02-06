# TODO

## Now
- [x] Verify prod Convex deployment is connected (env + Convex URLs) and app points to prod DB.
- [ ] Remove/disable VTB online payments from checkout UI and backend flow.
- [x] Run `bun run lint` and `bun run typecheck`, fix issues.
- [x] Block privileged access for users with `status: blocked` in shared auth helpers.
- [x] Harden checkout/order creation on server:
  - [x] Server-owned delivery pricing (ignore client delivery price input).
  - [x] Enforce orderability: item exists, status allows ordering, in stock, valid quantity.
  - [x] Prevent duplicate orders from concurrent checkout submits (idempotency/locking).
  - [x] Make public order number generation collision-safe.
- [x] Sanitize public order response (`orders.get_order_by_id`) to avoid leaking internal fields/PII.
- [ ] Disable or remove production-exposed debug/test surfaces:
  - [x] `convex/test_category_filter.ts`
  - [x] `app/convex-test/page.tsx`
  - [ ] Review `convex/debug.ts` / `convex/import.ts` / `convex/export.ts` exposure.

## Next
- [ ] Review catalog queries for scalability; reduce in-memory sorting or document limits.
- [x] Tighten cart integrity rules:
  - [x] Enforce quantity bounds in merge/update flows (integer + max cap).
  - [x] Validate `itemId` existence/orderability in `addItem`.
- [ ] Review manager/admin workflows for completeness and document expected actions.
- [ ] Decide manager access model (global vs assignment-scoped orders/leads) and enforce least privilege.
- [ ] Prevent orphaned `orderItems` on order deletion (cascade or soft-delete strategy).

## Later
- [ ] Add production monitoring/alerting checklist (Convex logs, error tracking).
- [ ] Add smoke test checklist for deployment (critical pages + checkout flow).
- [ ] Add explicit runtime env validation for critical vars (`NEXT_PUBLIC_CONVEX_URL`, `CONVEX_SITE_URL`, auth secrets).
- [ ] Add baseline security headers in Next config (CSP/HSTS/frame protections per deployment model).

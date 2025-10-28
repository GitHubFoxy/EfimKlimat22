# Project Check‑List — MVP ➜ Production (VTB Checkout)

This checklist tracks remaining MVP scope and the path to a production release with VTB acquiring for checkout.

## 1) MVP — Remaining Items

- Checkout flow (server + UI)
  - [ ] Implement `placeOrder` mutation in Convex that:
    - Reprices cart (`cart:reprice`) just before placement
    - Validates stock/quantity bounds
    - Creates an `orders` row (status = `pending`, snapshot `itemId[]`, `total`)
    - Stores buyer contact fields (`name`, `phone`, `email`, `address`, `comment`)
    - Clears the cart on success
  - [ ] Wire Checkout page submit to call `placeOrder` and show success screen with order number
  - [ ] Basic email/SMS notification to manager (optional for MVP, but recommended)

- Orders management (manager)
  - [ ] Create “Callback” page for managers to view new `pending` orders and customer contacts
  - [ ] Add actions to update order status: `pending ➜ processing ➜ done`

- Catalog/Admin
  - [ ] Edit existing item details in Dashboard (update mutation + UI)
  - [ ] Ensure `category_items` bridge table is maintained when items are added/edited (insert/update links)
  - [ ] Improve item validation (required fields, price format, variant)

- Legal pages
  - [ ] Create real pages for “Пользовательское соглашение” and “Политика конфиденциальности” and link them in Footer

- UX/Polish
  - [ ] Toasts/inline errors for mutations (add, update, delete, checkout)
  - [ ] Loading states/skeletons reviewed across pages
  - [ ] Responsive review for Dashboard and Checkout

## 2) Production Path — VTB Checkout Integration

Target: Move from MVP (manual confirmation/”manager will contact you”) to online acquiring with VTB.

- Credentials & Sandbox
  - [ ] Obtain VTB acquiring credentials (Merchant ID/Terminal ID/API keys/certificates)
  - [ ] Set up sandbox/test environment
  - [ ] Define environment variables in Vercel/Convex (no secrets in repo)

- Server integration (Convex)
  - [ ] Implement `payments.vtb.createPaymentSession` (Convex action) to call VTB API and return payment URL + `orderId`
    - Note: Actions don’t use `ctx.db`; persist via `ctx.runMutation` into a `payments`/`orders` record
  - [ ] Add HTTP endpoint `convex/http.ts` route `/api/vtb/callback` using `httpRouter` + `httpAction`
    - Verify VTB signature/HMAC
    - Update order status via internal mutation
    - Persist transaction details (amount, currency, status, rrn/psp references)
  - [ ] Add refunds/cancel endpoint (optional for launch; plan ahead)

- Client flow (Checkout page)
  - [ ] On submit: create local order ➜ call `createPaymentSession` ➜ redirect to VTB payment page
  - [ ] Handle return URL outcomes: success/failure/cancel
  - [ ] Display confirmation with order number; if failure, show retry path

- Compliance & Receipts (Russia)
  - [ ] Confirm 54‑ФЗ requirements for online payments (ОФД/fiscalization)
  - [ ] Decide whether VTB/aggregator handles receipts or integrate with OFD provider
  - [ ] Update privacy policy and user agreement to reflect payment/data processing

- Observability & Reliability
  - [ ] Logging of payment attempts, webhooks, and order lifecycle
  - [ ] Error reporting/alerts (failed webhooks, signature mismatches)
  - [ ] Idempotency for webhook handlers

## 3) Infrastructure & Operations

- Hosting & env
  - [ ] Frontend on Vercel, Convex Cloud for backend
  - [ ] Configure domain, TLS, CDN caching for static assets
  - [ ] Secrets management for VTB creds (Vercel/Convex env vars)

- Performance
  - [ ] Image optimization (Next/Image is used; verify sizes for catalog/list)
  - [ ] Index coverage review (search, category, sale, orders)

- QA
  - [ ] E2E tests: add to cart ➜ checkout ➜ payment success/fail ➜ webhook ➜ order status update
  - [ ] Load test critical endpoints (catalog, cart, checkout)

## 4) Optional/Nice‑to‑Have (Post‑MVP)

- Search improvements
  - [ ] Full‑text search over description (Convex searchIndex)
  - [ ] Semantic search (vector) for “similar items” later

- Marketing & UX
  - [ ] “Similar products” block on item page
  - [ ] Coupons/promotions and discount rules

## Open Questions

1. VTB acquiring: do you already have Merchant credentials (sandbox/prod)?
2. Return URLs: preferred success/failure routes and copy?
3. Receipts (54‑ФЗ): will VTB/aggregator handle fiscalization or should we integrate OFD?
4. Shipping rules: flat rate vs dynamic (region/weight)? For MVP it’s “Уточняется”; any target logic?
5. Notifications: email/SMS provider preference (e.g., SMTP, SendGrid, Twilio)?
6. Manager UI scope: which fields/filters do you need to process orders fast?

If you confirm the answers, I’ll break these into actionable tasks and start implementing.
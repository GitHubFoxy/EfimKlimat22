# Cart Functionality — Approaches, Best Practices, and Comparisons

This guide explains how to implement a robust shopping cart for a Next.js + Convex application. It covers data modeling, client/server responsibilities, optimistic updates, anonymous vs authenticated carts, and compares different approaches so you can pick what fits your product and team best.

## Goal
- Deliver a cart that is fast, reliable, and consistent across devices.
- Support both anonymous visitors and logged-in users.
- Keep totals accurate and guard against price/stock drift.

## Approaches Overview
- Client-side only (Context + `localStorage`)
  - Pros: No backend needed, instant UX, simplest to start.
  - Cons: No cross-device sync, easy to lose data, totals can become inconsistent, harder to enforce stock/price rules.
- Server-backed (Convex) with anonymous session
  - Pros: Persists cart across refreshes, can reprice and validate stock server-side, easy to merge later.
  - Cons: Requires basic schema and server functions; adds a round-trip on first load.
- Server-backed with authentication
  - Pros: First-class cross-device sync, durable state, secure validation.
  - Cons: Requires auth integration, migration path for existing anonymous carts.
- Hybrid (Recommended)
  - Client keeps transient UI state for immediate feedback (optimistic updates), Convex stores the source of truth and validates totals/stock. Anonymous session can later merge into a user cart.

## Data Model (Convex)
- Tables (example):
  - `carts`:
    - `_id`: Cart ID.
    - `owner`: `string | null` (userId when logged-in; `null` for anonymous).
    - `sessionId`: `string | null` (anonymous cart key stored in `localStorage`).
    - `currency`: `string`, e.g., `"RUB"`.
    - `status`: `"active" | "ordered" | "abandoned"`.
    - `createdAt`, `updatedAt`.
  - `cart_items`:
    - `_id`: Item row ID.
    - `cartId`: Ref to `carts`.
    - `itemId`: Product ID.
    - `name`, `image` (snapshot for display stability).
    - `price`: Number (snapshot for added-at price; revalidate before checkout).
    - `quantity`: Number (bounded; e.g., `1..99`).
    - `variant`: Optional SKU/size.
    - `updatedAt`.
- Indexes:
  - `cart_items.by_cartId`
  - `carts.by_owner`
  - `carts.by_sessionId`
- Notes:
  - Keep a canonical product price source; snapshot price at add-time but re-evaluate on checkout.
  - If inventory is tracked, validate quantity against stock before mutations.

## Convex Functions (API)
- Queries:
  - `cart:get`: Fetch cart summary (`subtotal`, `discounts`, `shipping`, `tax`, `total`).
  - `cart:listItems`: List cart items by `cartId`.
- Mutations:
  - `cart:createIfMissing({ sessionId })`: Create an anonymous cart if absent; return `cartId`.
  - `cart:addItem({ cartId, itemId, name, price, image, variant })`: Upsert with `quantity += 1`.
  - `cart:updateQty({ cartItemId, quantity })`: Bound quantity; 0 removes.
  - `cart:removeItem({ cartItemId })`: Delete line.
  - `cart:clear({ cartId })`: Remove all items.
- Actions:
  - `cart:mergeAnonymousIntoUserCart({ sessionId, userId })`: On login, merge anonymous into user cart; resolve duplicates by summing quantities, reprice.
  - `cart:reprice({ cartId })`: Recompute totals from current catalog/pricing rules.

## Client Integration (Next.js)
- Session management:
  - Generate a stable `sessionId` on first visit: `localStorage.getItem('cartSessionId') ?? crypto.randomUUID()`; store it.
  - Pass `sessionId` to server so the cart persists across refreshes.
- Data fetching:
  - Use `useQuery(api.cart.get, { sessionId })` for cart summary.
  - Use `useQuery(api.cart.listItems, { sessionId })` to render lines.
- Mutations & optimistic updates:
  - Call `useMutation(api.cart.addItem)` from product cards.
  - Optimistically increment item count locally and roll back on error (see `lib/HowToOptimisticUpdate.md`).
  - Batch UI updates where possible; debounce rapid qty changes.
- Hydration & UX:
  - Show a lightweight skeleton for cart dropdown/page while query hydrates.
  - Avoid layout shifts by reserving space for totals.

## Anonymous vs Authenticated
- Anonymous:
  - `carts.owner = null`, keyed by `sessionId` from the browser.
  - Keep cart in Convex to avoid full reliance on `localStorage`.
- Authenticated:
  - `carts.owner = userId`; queries filter by owner.
  - On login: run `cart:mergeAnonymousIntoUserCart`. Remove/expire the anonymous `sessionId` after successful merge.
  - Keep cart totals authoritative on the server; client renders but does not trust local computations for checkout.

## Totals & Pricing
- Compute on the server to avoid trust issues:
  - `subtotal = sum(qty * unit_price)` from current price source (or snapshot + revalidation step).
  - `discounts`: coupons, tiered pricing, promos.
  - `shipping`: rules by weight/region/method.
  - `tax`: rate by region; include/exclude VAT as needed.
  - `total = subtotal - discounts + shipping + tax`.
- Reprice before order placement to prevent stale pricing.

## Edge Cases
- Product deleted or disabled: flag items as unavailable; suggest removal.
- Price changed: show a banner “Price updated”; reprice cart.
- Stock reduced: clamp `quantity` to available; inform the user.
- Max quantity guard: e.g., `1..10` per SKU.
- Image missing: use fallback `"/not-found.jpg"`.

## UI Patterns
- “Add to Cart” button on product list and details pages.
- Header cart with count and quick dropdown.
- Cart page with editable quantities, remove, and coupon entry.
- Subtle transitions, disabled states during mutation, and clear error messages.

## Testing & Validation
- Unit-test pricing logic and quantity bounds.
- Integration-test `add/update/remove/merge` flows.
- Ensure server rejects invalid item IDs and negative quantities.
- Verify optimistic updates roll back on mutation errors.

## Performance Tips
- Use indexes: `by_cartId`, `by_owner`, `by_sessionId`.
- Fetch items in one query; avoid N+1. Use `db.getMany` when referencing multiple product docs.
- Memoize derived totals client-side but treat server as source of truth.
- Keep payloads small; snapshot only needed product fields for cart rendering.

## Security & Integrity
- Validate all mutation inputs server-side.
- Compute totals server-side; never trust client-submitted totals.
- Rate-limit coupon application if necessary.
- Consider idempotency for repeated `addItem` calls.

## Comparison of Methods
- Client-only:
  - Pros: Simple, zero backend.
  - Cons: No cross-device sync, fragile, difficult to enforce pricing/inventory.
- REST backend:
  - Pros: Familiar pattern, language-agnostic.
  - Cons: More boilerplate, manual state reconciliation, optimistic updates are harder.
- Convex backend (Recommended here):
  - Pros: Simple queries/mutations, real-time updates, great developer experience, easy optimistic patterns, no schema migrations overhead.
  - Cons: Requires adopting Convex; learning curve for first-time users.

## Recommended Approach for This Project
- Hybrid with Convex:
  - Anonymous cart backed by Convex using a `sessionId` stored in `localStorage`.
  - On login, merge anonymous into user cart with a Convex action.
  - Use `useQuery` for cart state and totals; `useMutation` for item changes with optimistic UI.
  - Reprice before checkout; validate stock changes.

## Step-by-Step Implementation Outline
1. Define tables and indexes in `convex/schema.ts` for `carts` and `cart_items`.
2. Implement queries: `cart:get`, `cart:listItems` in `convex/cart.ts`.
3. Implement mutations: `cart:createIfMissing`, `cart:addItem`, `cart:updateQty`, `cart:removeItem`, `cart:clear`.
4. Implement actions: `cart:mergeAnonymousIntoUserCart`, `cart:reprice`.
5. Create a client hook to manage `sessionId` in `localStorage` and pass it to queries/mutations.
6. Wire product cards and cart UI to `useMutation` calls; add optimistic updates.
7. Render cart dropdown and page with `useQuery` data; handle loading, errors.
8. Add a checkout pre-step that calls `reprice` and validates stock.
9. Write tests for mutations and pricing logic.

## Example Function Signatures (Conceptual)
- `useQuery(api.cart.get, { sessionId })`
- `useQuery(api.cart.listItems, { sessionId })`
- `const addItem = useMutation(api.cart.addItem)`
- `const updateQty = useMutation(api.cart.updateQty)`
- `const removeItem = useMutation(api.cart.removeItem)`
- `const merge = useAction(api.cart.mergeAnonymousIntoUserCart)`

This blueprint scales from a minimal cart to a production-ready flow while keeping UX snappy and data consistent. Start with the hybrid Convex-backed approach and iterate with pricing rules, coupons, and checkout as your product evolves.
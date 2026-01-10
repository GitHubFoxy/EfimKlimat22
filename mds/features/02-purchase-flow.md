# Feature 02: Purchase Flow Completion

## Overview

Complete the end-to-end user flow for purchasing products and lead generation.

## Tasks

- [ ] **Leads Fix**: Implement `submit_consultant_request` mutation in `convex/consultants.ts`.
- [ ] **Checkout**: Add `deliveryType` (pickup/courier/transport) and `address` fields to checkout form.
- [ ] **Order Page**: Create `/order/[id]` confirmation page for post-checkout verification.
- [ ] **Manager UI**: Connect order status update mutations (Confirmed/Processing/Done) to table actions.

## Requirements

- Support "Самовывоз", "Курьером", "Транспортной компанией" delivery types.
- Address field visibility should be conditional based on delivery type.
- Order confirmation page should be accessible via public URL (no auth required for verification).

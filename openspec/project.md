# Project Context

## Purpose
EfimKlimat22 is an e-commerce site for "Климат 22" (HVAC equipment and engineering plumbing) serving Barnaul, Russia. The project provides a product catalog, shopping cart, checkout flow, and management tools for handling orders and consultation requests.

Primary goals:
- Showcase brands and items (gas boilers, heating equipment, engineering plumbing) with images, pricing, descriptions, and optional filters.
- Enable visitors to search, browse by category and filter, add items to a cart, and place orders.
- Support a lightweight manager workflow for claiming/unclaiming orders and consultation requests, and updating their statuses.
- Provide basic admin tooling to add/edit items, manage brands and categories, and upload product images.

## Tech Stack
- Frameworks: Next.js 15 (App Router), React 19, TypeScript 5
- Backend/data: Convex (queries, mutations, storage) with validators and indexed queries
- UI: Tailwind CSS v4 (via @tailwindcss/postcss), shadcn/ui components, Radix UI primitives, Lucide icons
- Styling: Tailwind theme tokens and CSS variables in app/globals.css; tw-animate-css plugin
- State and data fetching: convex/react hooks (useQuery, useMutation, usePaginatedQuery)
- Images & file storage: Convex storage with signed URLs (generateUploadUrl, storage.getUrl, storage.delete)
- Carousel & UX: embla-carousel-react; react-responsive; react-dropzone
- Tooling: ESLint 9 (Next.js preset), Prettier 3, TypeScript, npm-run-all
- Package manager: pnpm (pnpm-lock.yaml present)
- Env: NEXT_PUBLIC_CONVEX_URL required by ConvexClientProvider

## Project Conventions

### Code Style
- Language: TypeScript across frontend and Convex functions
- Linting: eslint-config-next (core-web-vitals, typescript). Some TS rules disabled for DX: no-unused-vars and no-explicit-any are turned off
- Formatting: Prettier configured (minimal {} config). Tailwind class utilities used extensively
- Naming:
  - Files and routes follow Next.js App Router conventions (e.g., app/catalog/page.tsx, app/manager/page.tsx)
  - Convex functions use snake_case for exported function names (e.g., list_items_by_category, register_manager)
  - Database fields generally use camelCase (e.g., lowerCaseName, imageStorageIds)
- Localization: UI and content predominantly in Russian (ru). Inter font loaded via next/font
- Environment configuration via process.env (NEXT_PUBLIC_CONVEX_URL)

### Architecture Patterns
- App Router structure under app/ with pages for catalog, checkout, dashboard, manager, and auth
- Data layer is Convex:
  - Strict validators for args and returns (v.string, v.id, v.union, paginationOptsValidator, etc.)
  - Indexed queries via withIndex; no filter scans on large tables
  - Pagination via .paginate(paginationOpts) for manager/consultants/catalog lists
  - Storage for product images (upload via generateUploadUrl, then ctx.storage.getUrl and store URLs/IDs)
- Domain tables (convex/schema.ts): users, brands, items, categorys, subcategorys, carts, cart_items, category_items (bridge), orders, consultants
  - Notable indexes: by_phone, by_role, by_category, by_category_orders, by_category_sale, by_lowercase_name, by_status_and_updatedAt, by_assignedManager_status_updatedAt, etc.
  - Bridge table category_items supports fast reads of items within categories and descendants
- Cart & checkout:
  - Anonymous session cart maintained via localStorage (hooks/useCartSessionId)
  - Cart CRUD: addItem, updateQty, removeItem, clear; compute subtotal/count client-side from query results
  - createOrder turns a cart into an order, creates/looks up a user by phone, clears cart items, and marks cart status=ordered
  - mergeAnonymousIntoUserCart merges session cart into a user-owned cart when appropriate
- Manager & Admin flows:
  - Manager can view orders by status, claim/unclaim orders, and update statuses
  - Consultants (callback requests) can be listed by status, claimed/unclaimed, and updated
  - Admin/dashboard page supports item creation (with image upload), deleteItem, listing brands/categories/subcategories
- Search:
  - main.search_items performs prefix-like search on items.lowerCaseName using range query on by_lowercase_name index, falls back to top-ordered items
- Styling system:
  - app/globals.css defines CSS variables for color tokens, oklch values, and Tailwind theme integration
  - Dark mode variant defined via custom variant and .dark scope

### Testing Strategy
- No formal test framework or test scripts currently present in package.json
- Current approach appears to be manual verification through UI and Convex dashboard
- Proposed future additions (to discuss/confirm):
  - Unit tests for critical Convex mutations/queries (e.g., cart operations, createOrder)
  - Integration tests for page flows (catalog filtering, checkout)
  - Type-level tests or stricter ESLint/TS rules once flows stabilize

### Git Workflow
- Repository includes pnpm-lock.yaml; standard Git usage assumed. No explicit documented branching or commit convention found
- Suggested (to confirm with team):
  - Trunk-based with feature branches per area (catalog, cart, manager, dashboard)
  - Conventional Commits for clarity (feat:, fix:, refactor:, docs:)
  - PR review for schema changes or Convex function changes due to data/index constraints

## Domain Context
- Brand and store: "Климат 22" in Barnaul; contact info in lib/consts.ts (phone, email, address). Catalog filters in Russian: "Хиты продаж" (top sellers), "Новинки" (new items), "Со скидкой" (discounted)
- Roles: user, manager, admin. Manager login/register flows are simplified (convex/auth.ts). Manager UI gated via localStorage token; role selection assist available in dev
- Orders: created from cart; managers can filter, claim/unclaim, and update status (pending, processing, done)
- Consultants: free consultation requests captured; managers can claim/unclaim and process
- Categories: categorys and subcategorys tables; category_items bridge used for efficient item reads
- Search: prefix search against lowerCaseName using by_lowercase_name index

## Important Constraints
- Convex data model constraints:
  - Indexed query order must match index definition (e.g., by_status_and_updatedAt queried with status then updatedAt)
  - Validators must be present for args and returns for all Convex functions
- Storage limits and usage: Convex storage used for images; signed URLs retrieved at runtime. Ensure images exist before relying on URLs
- Minimal auth currently: manager login/register by phone; localStorage token gating. PII (phone numbers) stored; be mindful of privacy/legal requirements
- Russian locale defaults (ru) and currency RUB. Price formatting in dashboard uses ru-RU locale
- ENV requirement: NEXT_PUBLIC_CONVEX_URL must be set for client to connect to Convex
- Performance: Use withIndex and pagination to avoid table scans. Avoid actions accessing ctx.db (actions not present currently)

## External Dependencies
- Convex Cloud (database, functions, storage) — accessed via NEXT_PUBLIC_CONVEX_URL
- Google Fonts (Inter) via next/font
- Telegram and WhatsApp for external contact links (lib/consts.ts)
- embla-carousel-react for carousels; react-dropzone for file uploads; shadcn/ui and Radix primitives for UI

Open items for confirmation:
- Hosting/deployment target (e.g., Vercel) — not documented yet
- Formal auth provider and user account management beyond phone-based flows — not implemented yet

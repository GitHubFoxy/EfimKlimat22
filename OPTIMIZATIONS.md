# Reuse & Elegance Opportunities

This document summarizes areas where structure, reuse, and clarity can be improved across the project. Each section lists representative files plus concrete refactor ideas so the team can pick targets incrementally.

## Navigation & Layout

- **Shared nav data**: `components/Header/DesktopHeader.tsx`, `components/Header/MobileHeader.tsx`, and `components/Footer.tsx` all hardcode nearly identical link arrays and anchor-scroll logic. Extract a `NAV_LINKS` constant (e.g., `lib/navigation.ts`) plus a reusable `SmoothAnchorLink` helper so updates propagate everywhere.
- **Page chrome duplication**: pages such as `app/page.tsx`, `app/catalog/CatalogClient.tsx`, `app/catalog/[id]/ItemClient.tsx`, and `app/checkout/page.tsx` manually wrap their content with the same padding plus `Header`/`Footer`. Introduce a `PageContainer` (or layout slot) that standardizes spacing and optional chrome.
- **Search box patterns**: `components/Header/HeaderSearch.tsx` reimplements debouncing and dropdown plumbing. A small `useDebouncedValue` hook and an `AutocompletePopover` component would simplify this and support future search-like experiences (e.g., manager filters).

## Catalog Experience

- **Catalog client monolith**: `app/catalog/CatalogClient.tsx` handles state, Convex queries, search results, filters, and pagination in one component. Split responsibilities into hooks (`useCatalogFilters`, `useCatalogSearch`) and leaf components (`CatalogSearchResults`, `CatalogPageShell`) to keep logic testable.
- **Filter constants**: `components/CatalogComponents/CatalogFilters.tsx` defines its own filter list even though `lib/consts.ts` exports `FILTERS`. Import the constant and render pills via data. A reusable `FilterPillGroup` would also benefit `components/BestDealsClient.tsx`.
- **Result states**: `CatalogResultsGrid`, `CatalogResultsWrapper`, and `CatalogSearch` each render bespoke empty/loading placeholders. Centralize these through `components/ui/EmptyState.tsx` helpers so messaging and styling remain consistent.

## Marketing & Content Blocks

- **Static data inline**: Components like `components/WhyUs.tsx` and `components/Brands.tsx` embed their datasets directly in JSX. Move this copy into `lib/content/home.ts` (or CMS data) so marketing edits avoid touching components.
- **Footer complexity**: `components/Footer.tsx` combines company info, link lists, three dialogs, contact data, and map embeds in a single block. Break it into subcomponents (e.g., `FooterAbout`, `FooterLinks`, `FooterDialogs`, `FooterMap`) plus a shared `LegalDialog` shell for clarity and reuse.
- **Price formatting**: `components/BestDealsClient.tsx`, `components/ItemCard.tsx`, and checkout summaries manually format prices. Ensure everything funnels through `formatPrice` in `lib/utils.ts` for locale accuracy.

## Checkout & Lead Capture

- **Duplicate validation**: `components/FreeConsultmant.tsx` and `app/checkout/page.tsx` both manage name/phone validation, consent checkbox states, and success dialogs. Build a shared `LeadForm` component or `useValidatedForm` hook to centralize logic.
- **Checkout monolith**: `app/checkout/page.tsx` mixes skeletons, empty states, order summary, dialogs, and form handling. Extract `OrderSummary`, `CheckoutForm`, and `InfoDialog` components; wrap the page in a dedicated `CheckoutLayout` that takes care of the header/footer.

## Manager Dashboard

- **Single 2k-line file**: `app/manager/page.tsx` contains auth logic, tab navigation, paginated lists, dialogs, and forms. Split per domain (`ManagerOrdersPanel`, `ManagerConsultantsPanel`, `ManagerItemsPanel`, `ManagerUsersPanel`) and move shared bits (status selects, view toggles) into `components/manager/` helpers.
- **Image upload duplication**: Both the create and edit flows duplicate Convex upload logic and object-URL cleanup. Encapsulate this in `useConvexImageUploader` so limits, error handling, and cleanup live in one place.
- **Option lists & selects**: Status arrays (`ORDER_STATUS_OPTIONS`, `CONSULTANT_STATUS_OPTIONS`) plus repeated select UIs should move into `manager/constants.ts` and reusable select components for consistency.

## Shared Utilities & Hooks

- **Smooth scrolling**: Desktop header, mobile menu, and hero CTA each implement `document.getElementById` + `scrollIntoView` manually. A `useSmoothScroll(targetId)` hook or `SmoothAnchorLink` component would remove duplication and reduce bugs.
- **Cart summaries**: `components/Cart/HeaderCart.tsx` and checkout totals present similar data with different markup. Introduce a `CartSummary` component/util so price math, pluralization, and action buttons stay aligned.
- **Breadcrumbs**: Product detail breadcrumbs (`app/catalog/[id]/ItemClient.tsx`) could become a reusable `ProductBreadcrumbs` component, ready for future detail pages.

---

Focusing on these areas should make the project easier to reason about, accelerate future features, and keep UX consistent across screens. Let me know if you’d like me to start implementing any of the suggested pieces.

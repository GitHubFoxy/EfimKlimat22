# How to Implement Optimistic Updates (Convex)

This guide explains how to implement optimistic UI updates in your app using Convex. It focuses on adding items (`addItems`) and categories (`addCategory`), including lists that use pagination and index-driven ordering.

## What Are Optimistic Updates?
- Optimistic updates immediately reflect the expected mutation result in the UI, before the server confirms.
- If the mutation fails, Convex automatically rolls back the optimistic state to the canonical server state.

## Prerequisites
- Use client-callable mutations via `useMutation`. If your current mutations are `internal`, expose public wrappers that delegate to them (e.g., `addItemsPublic` → calls `internal addItems`).
- Ensure your optimistic objects match server shapes:
  - Category: `{ _id, name }`
  - Item: `{ _id, name, image, quantity, price, description, rating, orders, category, sale }`
- Use consistent filter values from `lib/consts.ts` → `FILTERS = ["Хиты продаж", "Новинки", "Со скидкой"]`.

## Core API
- `const mutate = useMutation(api.main.someMutation).withOptimisticUpdate((localStore, args) => { ... })`
- `localStore.getQuery(queryRef, args)` → current cached result for a query; returns `undefined` if not loaded.
- `localStore.setQuery(queryRef, args, newValue)` → replace cached result.
- For paginated queries: `optimisticallyUpdateValueInPaginatedQuery(localStore, queryRef, args, transformFn)` → safely update items across loaded pages.

## Temporary IDs
- Use `crypto.randomUUID()` to create a temporary `_id` for newly added documents so they can be placed in lists.
- Convex reconciles the final canonical document and replaces optimistic entries when the mutation completes.

## Example: Optimistic `addCategory`
```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AddCategoryButton() {
  const addCategory = useMutation(api.main.addCategoryPublic).withOptimisticUpdate(
    (localStore, args: { name: string }) => {
      const prev = localStore.getQuery(api.main.show_all_categories, {});
      if (!prev) return; // not loaded yet; skip
      const optimistic = {
        _id: crypto.randomUUID(),
        name: args.name,
      };
      localStore.setQuery(api.main.show_all_categories, {}, [...prev, optimistic]);
    }
  );

  return (
    <button onClick={() => addCategory({ name: "Новая категория" })}>
      Add Category
    </button>
  );
}
```

## Example: Optimistic `addItems` (Multiple Lists)
When adding an item, you may want to reflect it in several lists:
- `show_all_items` (full catalog)
- Landing sections: `main_page_new_comers`, `main_page_on_sale`, `main_page_most_orders`
- Category + filter page: `catalog_query_based_on_category_and_filter` (paginated)

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FILTERS } from "@/lib/consts";

export function AddItemForm() {
  const addItem = useMutation(api.main.addItemsPublic).withOptimisticUpdate(
    (
      localStore,
      args: {
        name: string;
        image: string;
        quantity: number;
        price: number;
        description: string;
        rating: number;
        orders: number;
        category: string; // category _id
        sale: number; // discount percent
      }
    ) => {
      const optimisticItem = {
        _id: crypto.randomUUID(),
        _creationTime: Date.now(), // used for ordering in "Новинки"
        ...args,
      };

      // 1) Full catalog (simple list). Insert according to your UI sort.
      const allItems = localStore.getQuery(api.main.show_all_items, {});
      if (allItems) {
        localStore.setQuery(api.main.show_all_items, {}, [optimisticItem, ...allItems]);
      }

      // 2) Landing sections respecting their order semantics.
      const newcom ers = localStore.getQuery(api.main.main_page_new_comers, {});
      if (newcom ers) {
        // Descending by _creationTime → insert at front
        localStore.setQuery(api.main.main_page_new_comers, {}, [optimisticItem, ...newcom ers]);
      }

      const onSale = localStore.getQuery(api.main.main_page_on_sale, {});
      if (onSale && optimisticItem.sale > 0) {
        // If you prefer higher sale first:
        const inserted = [optimisticItem, ...onSale].sort((a, b) => b.sale - a.sale);
        localStore.setQuery(api.main.main_page_on_sale, {}, inserted);
      }

      const mostOrders = localStore.getQuery(api.main.main_page_most_orders, {});
      if (mostOrders) {
        // Descending by orders
        const inserted = [optimisticItem, ...mostOrders].sort((a, b) => b.orders - a.orders);
        localStore.setQuery(api.main.main_page_most_orders, {}, inserted);
      }

      // 3) Category + Filter paginated list.
      // Update currently loaded pages only; Convex will reconcile later.
      // Branch logic must match server:
      //   - "Хиты продаж" → sort by orders desc
      //   - "Новинки"     → sort by _creationTime desc
      //   - "Со скидкой"  → sort by sale desc and sale > 0
      for (const filter of FILTERS) {
        const argsForQuery = { category: args.category, filter };

        // Useful for updates (not inserts):
        // optimisticallyUpdateValueInPaginatedQuery(localStore, api.main.catalog_query_based_on_category_and_filter, argsForQuery, (doc) => doc);

        // For inserting an item, you may fetch the first loaded page and prepend/sort.
        // NOTE: Convex doesn’t expose pages directly via localStore; the helper
        // is intended for mapping existing docs. A practical approach is to
        // optimistically update only if the item qualifies for the filter and
        // your UI keeps a separate local page buffer. Otherwise, rely on the
        // server reconciliation when the mutation completes.

        const qualifies =
          (filter === "Хиты продаж") ||
          (filter === "Новинки") ||
          (filter === "Со скидкой" && optimisticItem.sale > 0);

        if (!qualifies) continue;
        // If you maintain a local non-paginated preview slice for page 1,
        // update that slice here to insert the optimistic item respecting order.
      }
    }
  );

  // Call normally; UI reflects immediately.
  const onSubmit = (formValues: any) => {
    addItem(formValues);
  };

  return <form onSubmit={(e) => { e.preventDefault(); /* collect and call onSubmit */ }} />;
}
```

## Pagination Notes
- Your `catalog_query_based_on_category_and_filter` uses Convex pagination via `paginationOpts` on the backend.
- In React, use `usePaginatedQuery(api.main.catalog_query_based_on_category_and_filter, { category, filter })`.
- To optimistically modify items across loaded pages, use `optimisticallyUpdateValueInPaginatedQuery` and return a transformed document (e.g., adjusting `sale` or `orders`).
- For inserting new items into paginated lists, prefer updating a local preview slice or wait for server reconciliation.

## Error Handling & Rollback
- Show a toast or inline error if the mutation fails.
- Convex automatically rolls back any optimistic cache changes; you don’t need to manually revert.

## Tips & Gotchas
- Only update queries that are currently loaded (`getQuery(...) !== undefined`).
- Keep objects immutable; avoid mutating arrays in place.
- Respect server ordering and eligibility rules to avoid jarring reorders on reconciliation.
- Match query args exactly in `getQuery`/`setQuery` calls; optimistic changes are scoped by name + args.

## References
- Convex React: `useMutation`, `useQuery`, `usePaginatedQuery`
- Optimistic updates: `withOptimisticUpdate`, `localStore.getQuery`, `localStore.setQuery`
- Paginated helpers: `optimisticallyUpdateValueInPaginatedQuery`
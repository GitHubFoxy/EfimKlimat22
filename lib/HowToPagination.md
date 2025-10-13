# Convex Pagination — Minimal, Elegant Patterns

This guide shows how to implement server-side pagination in Convex and consume it from React using `usePaginatedQuery` with clean, minimal code.

## Backend — Paginated Query

Define a Convex query that accepts `paginationOpts` and returns the result of `paginate(...)`. Use indexes for efficient reads.

```ts
// convex/main.ts
import { v, query, paginationOptsValidator } from "convex/server";

export const list_items_by_category = query({
  args: {
    category: v.union(v.string(), v.null()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const qb = ctx.db.query("items");

    // If you have an index for category, prefer it:
    // return ctx.db
    //   .query("items")
    //   .withIndex("by_category", q => q.eq("category", args.category ?? ""))
    //   .order("desc")
    //   .paginate(args.paginationOpts);

    // Generic fallback without index (works, but less efficient):
    return qb.order("desc").paginate(args.paginationOpts);
  },
});
```

Notes:
- Always include `paginationOpts: paginationOptsValidator` in `args`.
- Return exactly what `paginate(...)` returns: `{ page, isDone, continueCursor }`.
- Prefer `withIndex(...)` to filter efficiently (e.g., by category or name prefix).

## Frontend — usePaginatedQuery

Use `usePaginatedQuery` in a Client Component to render results and load more.

```tsx
// components/ItemsList.tsx
"use client";
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function ItemsList({ category }: { category?: string }) {
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.main.list_items_by_category,
    { category: category ?? null },
    { initialNumItems: 12 },
  );

  return (
    <div>
      {isLoading && results.length === 0 ? (
        <div>Loading…</div>
      ) : (
        <ul>
          {results.map(item => (
            <li key={item._id}>{item.name}</li>
          ))}
        </ul>
      )}
      <button
        onClick={() => loadMore(12)}
        disabled={status !== "CanLoadMore"}
      >
        Load more
      </button>
    </div>
  );
}
```

Notes:
- `initialNumItems` controls the first page size.
- Call `loadMore(n)` only when `status === "CanLoadMore"`.
- The hook concatenates pages into `results` and manages cursors internally.

## Prefix Search + Pagination (Optional)

For name-based search, lowercase once at write-time and use a prefix range with an index.

```ts
// convex/main.ts
export const search_items = query({
  args: {
    q: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const qLower = args.q.trim().toLowerCase();
    if (!qLower) {
      return ctx.db
        .query("items")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const upperBound = qLower + "\uffff"; // simple prefix upper bound
    return ctx.db
      .query("items")
      .withIndex("by_lowercase_name", qb => qb.gte("lowerCaseName", qLower).lte("lowerCaseName", upperBound))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

Client usage:

```tsx
"use client";
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function SearchList({ q }: { q: string }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.main.search_items,
    { q },
    { initialNumItems: 10 },
  );

  return (
    <div>
      <ul>
        {results.map(item => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
      <button
        onClick={() => loadMore(10)}
        disabled={status !== "CanLoadMore"}
      >
        Load more
      </button>
    </div>
  );
}
```

## Optimistic Updates in Paginated Lists (Optional)

To reflect mutation results instantly in loaded pages:

```ts
import { optimisticallyUpdateValueInPaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

optimisticallyUpdateValueInPaginatedQuery(
  localStore,
  api.main.search_items,
  { q: "" },
  current => {
    if (current._id === updatedId) {
      return { ...current, name: newName };
    }
    return current;
  },
);
```

## Types — Helpful Inference

```ts
import { UsePaginatedQueryReturnType } from "convex/react";
import { api } from "../convex/_generated/api";

type SearchItemsPaginated = UsePaginatedQueryReturnType<typeof api.main.search_items>;
```

## Common Pitfalls

- Missing `paginationOpts` in server `args` or not returning `paginate(...)` result.
- Using substring match instead of prefix bounds with an index for search.
- Calling `usePaginatedQuery` in a Server Component (must be Client).
- Forgetting to lowercase and store `lowerCaseName` at write-time for search indexes.
- Not guarding empty queries — decide on behavior (return all vs. none).

## References

- Convex Docs — Pagination: https://docs.convex.dev/database/pagination
- Convex React API — `usePaginatedQuery`: https://docs.convex.dev/api/modules/react
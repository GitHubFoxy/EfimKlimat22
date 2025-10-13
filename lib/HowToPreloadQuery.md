# Next.js + Convex: preloadQuery Made Simple

This guide shows how to server-render Convex data in Next.js with `preloadQuery` while keeping the client reactive via `usePreloadedQuery`.

## When to use preloadQuery
- You want data available on first paint in a Client Component.
- You render on the server but still need live reactivity afterward.
- You want better SEO and initial UX without losing real-time updates.

`preloadQuery` uses `cache: 'no-store'` internally, so the Next.js Server Component won’t be statically rendered.

## Minimal Setup

Ensure Convex is available in your app layout (already in this project):

```ts
// app/layout.tsx
import { ConvexClientProvider } from "./ConvexClientProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

## Server Component: Preload Data

Call `preloadQuery` in a Server Component, then pass the `Preloaded` payload to a Client Component.

```ts
// app/example/TasksWrapper.tsx (Server Component)
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Tasks from "./Tasks";

export default async function TasksWrapper() {
  const preloadedTasks = await preloadQuery(api.main.catalog_query_based_on_category_and_filter, {
    category: null,
    filter: null,
    paginationOpts: { initialNumItems: 10 }, // ignored on server; client controls pagination
  });
  return <Tasks preloadedTasks={preloadedTasks} />;
}
```

Notes:
- Pass the same args shape your query expects (excluding client-only pagination controls).
- You can co-locate this wrapper in any route and compose multiple preloads if needed.

## Client Component: Use Preloaded Data

Consume the preloaded payload with `usePreloadedQuery`. The data will continue to update reactively.

```tsx
// app/example/Tasks.tsx (Client Component)
"use client";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Tasks(props: {
  preloadedTasks: Preloaded<typeof api.main.catalog_query_based_on_category_and_filter>;
}) {
  const data = usePreloadedQuery(props.preloadedTasks);

  if (!data) return <div>Loading…</div>;
  return (
    <ul>
      {data.page.map(item => (
        <li key={item._id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

Tip:
- If your query returns a paginated payload, you’ll see `{ page, isDone, continueCursor }` in `data`. Render `data.page`.

## With Authentication (Optional)

Pass an auth token to `preloadQuery` when your queries require it.

```ts
// Using Clerk
import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

async function getToken() {
  return (await (await auth()).getToken({ template: "convex" })) ?? undefined;
}

export default async function ProtectedWrapper() {
  const token = await getToken();
  const preloaded = await preloadQuery(
    api.main.search_items,
    { q: "baxi", paginationOpts: { initialNumItems: 10 } },
    { token },
  );
  return <ClientSearch preloaded={preloaded} />;
}
```

## Multiple Preloads

You can preload multiple queries in a single Server Component.

```ts
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ClientA from "./ClientA";
import ClientB from "./ClientB";

export default async function Page() {
  const [preloadedDeals, preloadedBrands] = await Promise.all([
    preloadQuery(api.main.main_page_by_filter, { filter: "Хиты продаж" }),
    preloadQuery(api.main.main_page_by_filter, { filter: "Скидки" }),
  ]);

  return (
    <>
      <ClientA preloaded={preloadedDeals} />
      <ClientB preloaded={preloadedBrands} />
    </>
  );
}
```

## TypeScript Helpers

```ts
import { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";

type PreloadedSearch = Preloaded<typeof api.main.search_items>;
```

## Common Pitfalls
- Forgetting to wrap your app with `ConvexClientProvider`.
- Trying to call `useQuery` in a Server Component — use `fetchQuery` or `preloadQuery` instead.
- Passing client-only options (like `initialNumItems`) to server and expecting pagination — use `usePaginatedQuery` on the client if you need infinite scroll.
- Not handling the paginated shape (`page`, `isDone`) in Client Components.

## References
- Convex Next.js server rendering: https://docs.convex.dev/client/react/nextjs/server-rendering
- Convex `preloadQuery` API: https://docs.convex.dev/api/modules/nextjs
- React `usePreloadedQuery`: https://docs.convex.dev/api/modules/react
How to Implement Search with Convex

- Goal: Lightweight prefix search on `items.name` using an index.

- Schema (convex/schema.ts):

```ts
items: defineTable({
  name: v.string(),
  nameLower: v.string(),
  // other fields
}).index("by_nameLower", ["nameLower"]);
```

- Insert/Update (convex/main.ts):

```ts
await ctx.db.insert("items", {
  name,
  nameLower: name.toLowerCase(),
  // other fields
});
```

- Query (convex/main.ts):

```ts
export const search_items = query({
  args: { term: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { term, limit = 20 }) => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return await ctx.db
      .query("items")
      .withIndex("by_nameLower", (x) =>
        x.gte("nameLower", q).lte("nameLower", q + "\uffff")
      )
      .take(limit);
  },
});
```

- Frontend (components/Header/HeaderSearch.tsx):

```tsx
const [term, setTerm] = useState("");
const results = useQuery(api.main.search_items, { term });

return (
  <div>
    <Input value={term} onChange={(e) => setTerm(e.target.value)} />
    <ul>
      {(results ?? []).map((i) => (
        <li key={i._id}>{i.name}</li>
      ))}
    </ul>
  </div>
);
```

## Vector Search — When and How

- When to use:
  - Semantic matching on descriptions or long text (synonyms, intent).
  - "Find similar items" even if names don’t share tokens.
  - Multilingual or fuzzy queries where prefix/full‑text isn’t enough.
- When not needed:
  - Name prefix search, categories, simple filters → use indexes.
  - Token-based matching on `description` → use full‑text `searchIndex`.
  - Small catalogs with straightforward search → stick to prefix.

### Minimal Vector Setup (Advanced)

- Schema (convex/schema.ts):

```ts
// Store embeddings separately for flexibility and filtering
itemsEmbeddings: defineTable({
  embedding: v.array(v.float64()),
  category: v.optional(v.string()),
}).vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 1536, // must match your embedding model
  filterFields: ["category"],
});

// Link items back to their embedding row
items: defineTable({
  name: v.string(),
  lowerCaseName: v.string(),
  description: v.string(),
  category: v.optional(v.string()),
  embeddingId: v.optional(v.id("itemsEmbeddings")),
}).index("by_embedding", ["embeddingId"]);
```

- Insert/Update (conceptual):

```ts
// 1) Generate embedding via your provider (e.g., OpenAI, etc.)
// 2) Insert into itemsEmbeddings and save its id on the item
```

- Action + Internal Query:

```ts
// convex/main.ts
import { v } from "convex/values";
import { action, internalQuery, query } from "./_generated/server";

export const semantic_item_search = action({
  args: { textQuery: v.string(), category: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { textQuery, category, limit = 16 }) => {
    const embedding = await embed(textQuery); // call your embedding API
    const results = await ctx.vectorSearch("itemsEmbeddings", "by_embedding", {
      vector: embedding,
      limit,
      filter: (q) => (category ? q.eq("category", category) : q),
    });
    const items = await ctx.runQuery(internal.items.fetch_by_embedding_ids, {
      ids: results.map((r) => r._id),
    });
    return items;
  },
});

export const fetch_by_embedding_ids = internalQuery({
  args: { ids: v.array(v.id("itemsEmbeddings")) },
  handler: async (ctx, args) => {
    const out: any[] = [];
    for (const id of args.ids) {
      const doc = await ctx.db
        .query("items")
        .withIndex("by_embedding", (q) => q.eq("embeddingId", id))
        .unique();
      if (doc) out.push(doc);
    }
    return out;
  },
});
```

- Client usage:

```tsx
// components/Header/HeaderSearch.tsx
"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function SemanticSearch() {
  const [q, setQ] = useState("");
  const searchSemantic = useAction(api.main.semantic_item_search);

  const [results, setResults] = useState<any[]>([]);
  const onSearch = async () => {
    const items = await searchSemantic({ textQuery: q });
    setResults(items ?? []);
  };

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <button onClick={onSearch}>Semantic Search</button>
      <ul>
        {results.map((i) => (
          <li key={i._id}>{i.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

Notes:
- Embedding generation runs outside Convex; call from an Action.
- Vector dimensions must match your index definition.
- Use `filterFields` in the vector index for facets (e.g., `category`).
- Vector search returns `_id` and `_score`; fetch docs via query.

### Full‑Text Search (Alternative)

If you need ranked token matching over `description`, use `searchIndex`:

```ts
// convex/schema.ts
items: defineTable({
  description: v.string(),
  category: v.optional(v.string()),
}).searchIndex("search_description", {
  searchField: "description",
  filterFields: ["category"],
});

// convex/main.ts
export const search_items_fulltext = query({
  args: { q: v.string(), category: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { q, category, limit = 20 }) => {
    const s = q.trim();
    if (!s) return [];
    return await ctx.db
      .query("items")
      .withSearchIndex("search_description", (x) =>
        x.search("description", s).eq("category", category ?? undefined),
      )
      .take(limit);
  },
});
```

## Do You Need Vector Search?

- Use prefix index on `lowerCaseName` for fast, predictable name lookups.
- Add full‑text `searchIndex` on `description` for ranked token queries.
- Choose vector search only if you need semantic similarity beyond text tokens.
- For this project’s item name search and simple filters, vector search is not necessary. Consider it later for "similar items" or intent‑based recommendations.
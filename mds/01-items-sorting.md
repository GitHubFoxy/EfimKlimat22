# Items Table Sorting Implementation

## Overview
Add sorting capabilities to the items table in /manager page. Users can sort by name, price, quantity, and orders count.

## Files to Modify

### 1. `convex/manager.ts` - Add sorting to list_items query

```typescript
// Replace existing list_items with this version
export const list_items = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sortBy: v.optional(
      v.union(
        v.literal("name"),
        v.literal("price"),
        v.literal("quantity"),
        v.literal("ordersCount"),
        v.literal("createdAt"),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, { paginationOpts, sortBy = "createdAt", sortOrder = "desc" }) => {
    let itemsQuery;

    // Use appropriate index based on sort field
    if (sortBy === "ordersCount") {
      // Use by_orders index: ["status", "ordersCount"]
      itemsQuery = ctx.db
        .query("items")
        .withIndex("by_orders", (q) => q.neq("status", "archived"));
    } else if (sortBy === "price") {
      // Use by_category_price but without category filter for global sort
      // Falls back to table scan with filter
      itemsQuery = ctx.db
        .query("items")
        .filter((q) => q.neq(q.field("status"), "archived"));
    } else {
      // Default: filter by status, sort by _creationTime
      itemsQuery = ctx.db
        .query("items")
        .filter((q) => q.neq(q.field("status"), "archived"));
    }

    // Apply sort order
    const orderedQuery = sortOrder === "asc" 
      ? itemsQuery.order("asc") 
      : itemsQuery.order("desc");

    const items = await orderedQuery.paginate(paginationOpts);

    // Enrich with brand names
    const itemsWithBrands = await Promise.all(
      items.page.map(async (item) => {
        const brand = await ctx.db.get(item.brandId);
        return {
          ...item,
          brandName: brand?.name || "Неизвестно",
        };
      }),
    );

    return {
      ...items,
      page: itemsWithBrands,
    };
  },
});
```

### 2. `app/manager/items-table-content.tsx` - Add sort controls

```typescript
"use client";

import { useState } from "react";
import { useQuery, usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { DataTable } from "./data-table";
import { getItemColumns, type Item } from "./columns";

type SortBy = "name" | "price" | "quantity" | "ordersCount" | "createdAt";
type SortOrder = "asc" | "desc";

interface ItemsTableContentProps {
  itemsPreload: Preloaded<typeof api.manager.list_items>;
  searchQuery?: string;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (id: any, name: string) => void;
}

export function ItemsTableContent({
  itemsPreload,
  searchQuery = "",
  onEditItem,
  onDeleteItem,
}: ItemsTableContentProps) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  // Reset cursor when search or sort changes
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setCursor(null);
  }

  const handleSortChange = (newSortBy: SortBy) => {
    if (newSortBy === sortBy) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setCursor(null); // Reset pagination on sort change
  };

  // Fetch items with sorting
  const itemsDataQuery = useQuery(api.manager.list_items, {
    paginationOpts: { numItems: 24, cursor },
    sortBy,
    sortOrder,
  });

  // Search query (sorting not applied to search results)
  const searchDataQuery = useQuery(
    api.manager.search_items,
    searchQuery
      ? {
          query: searchQuery,
          paginationOpts: { numItems: 24, cursor },
        }
      : "skip",
  );

  const itemsData = searchQuery ? searchDataQuery : itemsDataQuery;

  if (!itemsData) {
    return <div className="p-4 text-center text-gray-500">Загрузка...</div>;
  }

  // ... rest of the component with sort controls in header

  return (
    <>
      {/* Sort Controls */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-gray-600">Сортировка:</span>
        <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">По дате</SelectItem>
            <SelectItem value="name">По названию</SelectItem>
            <SelectItem value="price">По цене</SelectItem>
            <SelectItem value="quantity">По количеству</SelectItem>
            <SelectItem value="ordersCount">По заказам</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <ArrowUpDown className="w-4 h-4 mr-1" />
          {sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
        </Button>
      </div>

      {/* ... DataTable and pagination */}
    </>
  );
}
```

## Testing Checklist

- [ ] Sort by name works (A-Z and Z-A)
- [ ] Sort by price works (low-high and high-low)
- [ ] Sort by quantity works
- [ ] Sort by orders count works
- [ ] Pagination resets when sort changes
- [ ] Search results don't break when sorting is active
- [ ] Sort persists when navigating pages

## Notes

- Convex indexes can only sort by fields in the index, so some sorts may be slower
- Consider adding compound indexes if specific sort+filter combinations are common
- The `by_orders` index is ideal for sorting by ordersCount with status filter

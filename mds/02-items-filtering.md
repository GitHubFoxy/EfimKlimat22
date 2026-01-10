# Items Table Filtering Implementation

## Overview
Add filtering capabilities to the items table by brand, category, and status.

## Files to Modify

### 1. `convex/manager.ts` - Add filter arguments to list_items

```typescript
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

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
    // NEW: Filter arguments
    brandId: v.optional(v.id("brands")),
    categoryId: v.optional(v.id("categories")),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("draft"),
        v.literal("preorder"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { 
      paginationOpts, 
      sortBy = "createdAt", 
      sortOrder = "desc",
      brandId,
      categoryId,
      status,
    } = args;

    let itemsQuery;

    // Choose index based on filters
    if (categoryId && status) {
      // Use by_category_price index for category + status filter
      itemsQuery = ctx.db
        .query("items")
        .withIndex("by_category_price", (q) => 
          q.eq("categoryId", categoryId).eq("status", status)
        );
    } else if (brandId && status) {
      // Use by_brand_status for brand + status filter
      itemsQuery = ctx.db
        .query("items")
        .withIndex("by_brand_status", (q) => 
          q.eq("status", status).eq("brandId", brandId)
        );
    } else if (status) {
      // Use by_status index
      itemsQuery = ctx.db
        .query("items")
        .withIndex("by_status", (q) => q.eq("status", status));
    } else {
      // Default: exclude archived
      itemsQuery = ctx.db
        .query("items")
        .filter((q) => q.neq(q.field("status"), "archived"));
    }

    // Apply additional filters not covered by index
    if (brandId && !status) {
      itemsQuery = itemsQuery.filter((q) => q.eq(q.field("brandId"), brandId));
    }
    if (categoryId && !status) {
      itemsQuery = itemsQuery.filter((q) => q.eq(q.field("categoryId"), categoryId));
    }

    // Apply sort order
    const orderedQuery = sortOrder === "asc" 
      ? itemsQuery.order("asc") 
      : itemsQuery.order("desc");

    const items = await orderedQuery.paginate(paginationOpts);

    // Enrich with brand and category names
    const itemsWithDetails = await Promise.all(
      items.page.map(async (item) => {
        const [brand, category] = await Promise.all([
          ctx.db.get(item.brandId),
          ctx.db.get(item.categoryId),
        ]);
        return {
          ...item,
          brandName: brand?.name || "Неизвестно",
          categoryName: category?.name || "Без категории",
        };
      }),
    );

    return {
      ...items,
      page: itemsWithDetails,
    };
  },
});
```

### 2. `app/manager/items-filter-bar.tsx` - NEW FILE

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type ItemStatus = "active" | "draft" | "preorder";

interface ItemsFilterBarProps {
  brandId: Id<"brands"> | undefined;
  categoryId: Id<"categories"> | undefined;
  status: ItemStatus | undefined;
  onBrandChange: (id: Id<"brands"> | undefined) => void;
  onCategoryChange: (id: Id<"categories"> | undefined) => void;
  onStatusChange: (status: ItemStatus | undefined) => void;
  onClearFilters: () => void;
}

export function ItemsFilterBar({
  brandId,
  categoryId,
  status,
  onBrandChange,
  onCategoryChange,
  onStatusChange,
  onClearFilters,
}: ItemsFilterBarProps) {
  const brands = useQuery(api.manager.list_brands_all);
  const categories = useQuery(api.manager.list_categories_all);

  const hasActiveFilters = brandId || categoryId || status;

  const statusLabels: Record<ItemStatus, string> = {
    active: "Активный",
    draft: "Черновик",
    preorder: "Предзаказ",
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
      <span className="text-sm font-medium text-gray-700">Фильтры:</span>

      {/* Brand Filter */}
      <Select
        value={brandId ?? "__all__"}
        onValueChange={(v) => onBrandChange(v === "__all__" ? undefined : v as Id<"brands">)}
      >
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Все бренды" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все бренды</SelectItem>
          {brands?.map((brand) => (
            <SelectItem key={brand._id} value={brand._id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={categoryId ?? "__all__"}
        onValueChange={(v) => onCategoryChange(v === "__all__" ? undefined : v as Id<"categories">)}
      >
        <SelectTrigger className="w-[200px] bg-white">
          <SelectValue placeholder="Все категории" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все категории</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat._id} value={cat._id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={status ?? "__all__"}
        onValueChange={(v) => onStatusChange(v === "__all__" ? undefined : v as ItemStatus)}
      >
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все статусы</SelectItem>
          <SelectItem value="active">Активный</SelectItem>
          <SelectItem value="draft">Черновик</SelectItem>
          <SelectItem value="preorder">Предзаказ</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4 mr-1" />
          Сбросить
        </Button>
      )}

      {/* Active filters count */}
      {hasActiveFilters && (
        <span className="text-xs text-gray-500 ml-auto">
          Активных фильтров: {[brandId, categoryId, status].filter(Boolean).length}
        </span>
      )}
    </div>
  );
}
```

### 3. `app/manager/items-table-content.tsx` - Integrate filter bar

```typescript
"use client";

import { useState } from "react";
import { useQuery, usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ItemsFilterBar } from "./items-filter-bar";
// ... other imports
import type { Id } from "@/convex/_generated/dataModel";

type SortBy = "name" | "price" | "quantity" | "ordersCount" | "createdAt";
type SortOrder = "asc" | "desc";
type ItemStatus = "active" | "draft" | "preorder";

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
  
  // Filter state
  const [brandId, setBrandId] = useState<Id<"brands"> | undefined>();
  const [categoryId, setCategoryId] = useState<Id<"categories"> | undefined>();
  const [status, setStatus] = useState<ItemStatus | undefined>();

  // Reset cursor when filters change
  const handleFilterChange = () => {
    setCursor(null);
  };

  const handleClearFilters = () => {
    setBrandId(undefined);
    setCategoryId(undefined);
    setStatus(undefined);
    setCursor(null);
  };

  // Fetch items with filters and sorting
  const itemsDataQuery = useQuery(api.manager.list_items, {
    paginationOpts: { numItems: 24, cursor },
    sortBy,
    sortOrder,
    brandId,
    categoryId,
    status,
  });

  // ... rest of component

  return (
    <>
      {/* Filter Bar */}
      <ItemsFilterBar
        brandId={brandId}
        categoryId={categoryId}
        status={status}
        onBrandChange={(id) => { setBrandId(id); handleFilterChange(); }}
        onCategoryChange={(id) => { setCategoryId(id); handleFilterChange(); }}
        onStatusChange={(s) => { setStatus(s); handleFilterChange(); }}
        onClearFilters={handleClearFilters}
      />

      {/* Sort Controls */}
      {/* ... sort UI from 01-items-sorting.md */}

      {/* DataTable */}
      {/* ... table and pagination */}
    </>
  );
}
```

## Available Indexes Reference

From `convex/schema.ts`, the items table has these indexes:
- `by_orders`: `["status", "ordersCount"]`
- `by_category_price`: `["categoryId", "status", "price"]`
- `by_category_orders`: `["categoryId", "status", "ordersCount"]`
- `by_category_created`: `["categoryId", "status"]`
- `by_category_discount`: `["categoryId", "status", "discountAmount"]`
- `by_slug`: `["slug"]`
- `by_brand_status`: `["status", "brandId"]`
- `by_status`: `["status"]`
- `by_legacyId`: `["legacyId"]`

## Testing Checklist

- [ ] Filter by brand shows only items from that brand
- [ ] Filter by category shows only items in that category
- [ ] Filter by status shows only items with that status
- [ ] Combining filters works correctly (brand + status, category + status)
- [ ] Clearing filters resets to showing all non-archived items
- [ ] Pagination resets when filters change
- [ ] Filter counts are accurate
- [ ] Empty state shows when no items match filters

## Performance Notes

- Use indexed queries when possible (category + status, brand + status)
- Avoid filtering on multiple non-indexed fields
- Consider adding more indexes if specific filter combinations are slow

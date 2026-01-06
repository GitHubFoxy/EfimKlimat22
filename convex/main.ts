import { query } from "./_generated/server";
import { v } from "convex/values";

export const search_items = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }) => {
    if (!query.trim()) {
      return [];
    }

    const results = await ctx.db
      .query("items")
      .withSearchIndex("search_main", (q) =>
        q.search("searchText", query).eq("status", "active").eq("inStock", true),
      )
      .take(10);

    return results;
  },
});

export const main_page_by_filter = query({
  args: {
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Скидки"),
    ),
  },
  handler: async (ctx, { filter }) => {
    // Base query for active, in-stock items
    let itemsQuery = ctx.db
      .query("items")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc");

    // Apply additional filters
    if (filter === "Хиты продаж") {
      // Use orders count index for popular items
      itemsQuery = ctx.db
        .query("items")
        .withIndex("by_orders", (q) => q.eq("status", "active"))
        .order("desc");
    } else if (filter === "Скидки") {
      // Filter for items with discount
      itemsQuery = itemsQuery.filter((q) => q.gt(q.field("discountAmount"), 0));
    }
    // For "Новинки" we already have newest items by _creationTime due to order("desc")

    // Take first 4 items for main page
    const items = await itemsQuery
      .filter((q) => q.eq(q.field("inStock"), true))
      .take(4);

    // For "Хиты продаж", sort by ordersCount (already indexed)
    if (filter === "Хиты продаж") {
      // The by_orders index sorts by ordersCount descending when we order("desc")
      // No need to re-sort
    }

    // Fetch brand names for each item
    const itemsWithBrands = await Promise.all(
      items.map(async (item) => {
        const brand = await ctx.db.get(item.brandId);
        return {
          ...item,
          brandName: brand?.name || "Неизвестно",
        };
      }),
    );

    return {
      items: itemsWithBrands,
      filter,
      count: itemsWithBrands.length,
    };
  },
});

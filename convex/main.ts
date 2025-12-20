import { query } from "./_generated/server";
import { v } from "convex/values";

export const main_page_by_filter = query({
  args: {
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Скидки"),
    ),
  },
  handler: async (ctx, args) => {
    const { filter } = args;

    // Get active items sorted by the appropriate field
    if (filter === "Хиты продаж") {
      // Sort by orders count (most popular)
      return await ctx.db
        .query("new_items")
        .withIndex("by_orders", (q) => q.eq("status", "active"))
        .order("desc")
        .take(3)
    }

    if (filter === "Новинки") {
      // Sort by creation date (newest first)
      return await ctx.db
        .query("new_items")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(3)
     
    }

    if (filter === "Скидки") {
      // Sort by discount amount (highest discount first)
      return await ctx.db
        .query("new_items")
        .withIndex("by_discountAmount", (q) => q.eq("status", "active"))
        .order("desc")
        .take(3)
     
    }

    return { items: [] };
  },
});


export const search_items = query({
  args: {
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { query: searchQuery } = args;

    // If no query provided, return 3 most popular items
    if (!searchQuery || searchQuery.trim() === "") {
      return await ctx.db
        .query("new_items")
        .withIndex("by_orders", (q) => q.eq("status", "active"))
        .order("desc")
        .take(3);
    }

    // Search items using the search_main index
    // Filter by status: active to only show active items
    const results = await ctx.db
      .query("new_items")
      .withSearchIndex("search_main", (q) =>
        q.search("searchText", searchQuery).eq("status", "active")
      )
      .take(10); // Limit to 10 results for search preview

    return results;
  },
})

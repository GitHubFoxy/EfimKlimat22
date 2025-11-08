import { v } from "convex/values";
import { query } from "./_generated/server";

// List items for any category, including its descendants, via bridge table

export const search_items = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return await ctx.db
        .query("items")
        .withIndex("by_orders")
        .order("desc")
        .take(3);
    }

    // Substring match using JS .includes on lowerCaseName
    // Note: This scans the table; fine for small datasets. For large datasets,
    // prefer index-based prefix search or introduce a dedicated search index/table.
    const allItems = await ctx.db.query("items").collect();
    return allItems
      .filter((item) => {
        const inName = item?.lowerCaseName?.includes(q);
        const inBrand = item?.brand ? item.brand.toLowerCase().includes(q) : false;
        return Boolean(inName || inBrand);
      })
      .slice(0, 3);
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
    if (filter === "Хиты продаж") {
      const items = await ctx.db
        .query("items")
        .withIndex("by_orders")
        .order("desc")
        .take(3);
      return { items, status: 200 };
    }
    if (filter === "Скидки") {
      const items = await ctx.db
        .query("items")
        .withIndex("by_sale")
        .order("desc")
        .take(3);
      return { items, status: 200 };
    }
    // Новинки
    const items = await ctx.db.query("items").order("desc").take(3);
    return { items, status: 200 };
  },
});

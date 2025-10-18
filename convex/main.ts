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

    return await ctx.db
      .query("items")
      .withIndex("by_lowercase_name", (x) =>
        x.gte("lowerCaseName", q).lte("lowerCaseName", q + "\uffff"),
      )
      .take(3);
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

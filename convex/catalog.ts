import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const list_items_by_category = query({
  args: { categoryId: v.id("categorys") },
  handler: async (ctx, { categoryId }) => {
    const links = await ctx.db
      .query("category_items")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();
    const itemIds: Id<"items">[] = links.map((l) => l.itemId);
    const fetched = await Promise.all(itemIds.map((id) => ctx.db.get(id)));
    const items = fetched.filter(
      (x): x is Doc<"items"> => x !== null && x !== undefined,
    );
    return { items, count: items.length };
  },
});

export const catalog_query_based_on_category_and_filter = query({
  args: {
    category: v.id("categorys"),
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Со скидкой"),
    ),
    subcategory: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, filter, subcategory, paginationOpts }) => {
    let queryBuilder;

    if (filter === "Хиты продаж") {
      queryBuilder = ctx.db
        .query("items")
        .withIndex("by_category_orders", (q) => q.eq("category", category));
    } else if (filter === "Новинки") {
      queryBuilder = ctx.db
        .query("items")
        .withIndex("by_category", (q) => q.eq("category", category));
    } else {
      // "Со скидкой"
      queryBuilder = ctx.db
        .query("items")
        .withIndex("by_category_sale", (q) => q.eq("category", category));
    }

    // Apply subcategory filter if provided
    if (subcategory !== undefined && subcategory !== null) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("subcategory"), subcategory),
      );
    }

    return await queryBuilder.order("desc").paginate(paginationOpts);
  },
});

export const catalog_list_all_categories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categorys").order("asc").collect();
    return categories;
  },
});

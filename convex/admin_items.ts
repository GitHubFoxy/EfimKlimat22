import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list_items_paginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    // Optional filters for category and subcategory
    category: v.optional(v.id("categorys")),
    subcategory: v.optional(v.id("subcategorys")),
    // Optional search query
    search: v.optional(v.string()),
  },
  handler: async (ctx, { paginationOpts, category, subcategory, search }) => {
    const searchQuery = search?.trim().toLowerCase();

    // If search is provided, collect all items and filter in-memory
    // (Convex doesn't support LIKE/substring queries in indexed pagination)
    if (searchQuery) {
      let q = ctx.db.query("items");
      if (category) {
        q = q.filter((f) => f.eq(f.field("category"), category));
      }
      if (subcategory) {
        q = q.filter((f) => f.eq(f.field("subcategory"), subcategory));
      }
      const allItems = await q.collect();

      // Filter by search query (name, brand, variant)
      const filtered = allItems.filter((item) => {
        const inName = item.lowerCaseName.includes(searchQuery);
        const inBrand = item.brand
          ? item.brand.toLowerCase().includes(searchQuery)
          : false;
        const inVariant = item.variant
          ? item.variant.toLowerCase().includes(searchQuery)
          : false;
        return inName || inBrand || inVariant;
      });

      // Manual pagination for filtered results
      const startIndex = paginationOpts.cursor
        ? parseInt(paginationOpts.cursor, 10)
        : 0;
      const numItems = paginationOpts.numItems;
      const page = filtered.slice(startIndex, startIndex + numItems);
      const hasMore = startIndex + numItems < filtered.length;

      return {
        page,
        isDone: !hasMore,
        continueCursor: hasMore ? String(startIndex + numItems) : "",
      };
    }

    // No search: use normal pagination
    let q = ctx.db.query("items");
    if (category) {
      q = q.filter((f) => f.eq(f.field("category"), category));
    }
    if (subcategory) {
      q = q.filter((f) => f.eq(f.field("subcategory"), subcategory));
    }
    return await q.order("desc").paginate(paginationOpts);
  },
});

export const create_item = mutation({
  args: {
    brand: v.optional(v.string()),
    name: v.string(),
    quantity: v.number(),
    description: v.string(),
    price: v.number(),
    variant: v.string(),
    sale: v.optional(v.number()),
    // Optional part number support
    partNumber: v.optional(v.string()),
  },
  returns: v.object({ status: v.number(), itemId: v.id("items") }),
  handler: async (ctx, args) => {
    const lowerCaseName = args.name.toLowerCase();
    const itemId = await ctx.db.insert("items", { ...args, lowerCaseName });
    return { status: 200, itemId };
  },
});

export const update_item = mutation({
  args: {
    itemId: v.id("items"),
    brand: v.optional(v.string()),
    name: v.optional(v.string()),
    quantity: v.optional(v.number()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    variant: v.optional(v.string()),
    sale: v.optional(v.number()),
    // Allow updating category and subcategory
    category: v.optional(v.id("categorys")),
    subcategory: v.optional(v.id("subcategorys")),
    // Allow updating part number
    partNumber: v.optional(v.string()),
    // Allow updating collection
    collection: v.optional(v.string()),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { itemId, ...patch }) => {
    const existing = await ctx.db.get(itemId);
    if (!existing) throw new Error("Item not found");
    const toPatch: Record<string, any> = { ...patch };
    if (patch.name) {
      toPatch.lowerCaseName = patch.name.toLowerCase();
    }
    await ctx.db.patch(itemId, toPatch);
    return { status: 200 };
  },
});

export const delete_item = mutation({
  args: { itemId: v.id("items") },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { itemId }) => {
    await ctx.db.delete(itemId);
    return { status: 200 };
  },
});
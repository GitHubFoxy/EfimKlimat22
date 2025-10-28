import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list_items_paginated = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("items"),
        _creationTime: v.number(),
        brand: v.optional(v.string()),
        name: v.string(),
        lowerCaseName: v.string(),
        imagesUrls: v.optional(v.array(v.string())),
        imageStorageIds: v.optional(v.array(v.id("_storage"))),
        quantity: v.number(),
        description: v.string(),
        price: v.number(),
        rating: v.optional(v.number()),
        orders: v.optional(v.number()),
        category: v.optional(v.id("categorys")),
        variant: v.string(),
        sale: v.optional(v.number()),
        subcategory: v.optional(v.string()),
        color: v.optional(v.string()),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.union(v.string(), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, { paginationOpts }) => {
    return await ctx.db.query("items").order("desc").paginate(paginationOpts);
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
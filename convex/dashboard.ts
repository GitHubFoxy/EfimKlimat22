import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const show_all_items = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    return { items, status: 200 };
  },
});

export const show_all_categories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categorys").collect();
    return { categories, status: 200 };
  },
});

// Retrieve all subcategories based on selected category
export const show_subcategories_by_category = query({
  args: { parent: v.optional(v.id("categorys")) },
  handler: async (ctx, { parent }) => {
    if (!parent) return { subcategories: [], status: 200 };
    const subcategories = await ctx.db
      .query("subcategorys")
      .withIndex("by_parent", (q) => q.eq("parent", parent))
      .collect();
    return { subcategories, status: 200 };
  },
});

export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (doc?.imageStorageIds) {
      await Promise.all(
        doc.imageStorageIds.map((sid) => ctx.storage.delete(sid)),
      );
    }
    await ctx.db.delete(id);
    return { status: 200, message: "Item deleted" };
  },
});

export const addItemsPublic = mutation({
  args: {
    name: v.string(),
    imagesUrls: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    quantity: v.number(),
    price: v.number(),
    description: v.string(),
    rating: v.optional(v.number()),
    orders: v.optional(v.number()),
    category: v.optional(v.id("categorys")),
    sale: v.optional(v.number()),
    brand: v.optional(v.string()),
    variant: v.optional(v.string()),
    subcategory: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      name,
      imageStorageIds,
      quantity = 1,
      price,
      description = "",
      rating = 0,
      orders = 0,
      category,
      sale = 0,
      brand = "no brand",
      variant = "",
      subcategory,
    },
  ) => {
    const imageUrls = [];
    const imageStorageIdsArr = [];

    if (imageStorageIds?.length) {
      const urls = await Promise.all(
        imageStorageIds.map((sid) => ctx.storage.getUrl(sid)),
      );
      imageUrls.push(...urls.map((u) => u ?? "/not-found.jpg"));
      imageStorageIdsArr.push(...imageStorageIds);
    }
    await ctx.db.insert("items", {
      brand,
      name,
      lowerCaseName: name.toLowerCase(),
      imagesUrls: imageUrls,
      imageStorageIds: imageStorageIdsArr.length
        ? imageStorageIdsArr
        : undefined,
      quantity,
      description,
      price,
      rating,
      orders,
      category,
      sale,
      variant,
      subcategory,
    });
    return { status: 200, message: "Item added" };
  },
});

export const show_all_brands = query({
  handler: async (ctx) => {
    const brands = await ctx.db.query("brands").collect();
    return brands;
  },
});

export const add_brand = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const brandId = await ctx.db.insert("brands", { name });
    return { status: 200, message: "Brand added" };
  },
});

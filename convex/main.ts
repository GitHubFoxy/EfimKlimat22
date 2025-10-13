import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const addItemsPublic = mutation({
  args: {
    name: v.string(),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    quantity: v.number(),
    price: v.number(),
    description: v.string(),
    rating: v.optional(v.number()),
    orders: v.optional(v.number()),
    category: v.optional(v.id("categorys")),
    sale: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      name,
      image = "/not-found.jpg",
      imageStorageId,
      quantity = 1,
      price,
      description = "",
      rating = 0,
      orders = 0,
      category,
      sale = 0,
    },
  ) => {
    let imageUrl = image;
    if (imageStorageId) {
      const url = await ctx.storage.getUrl(imageStorageId);
      imageUrl = url ?? "/not-found.jpg";
    }
    await ctx.db.insert("items", {
      name,
      lowerCaseName: name.toLowerCase(),
      image: imageUrl,
      imageStorageId,
      quantity,
      description,
      price,
      rating,
      orders,
      category,
      sale,
    });
    return { status: 200, message: "Item added" };
  },
});

export const show_all_items = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    return { items, status: 200 };
  },
});

//delete image also
export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (doc?.imageStorageId) {
      await ctx.storage.delete(doc.imageStorageId);
    }
    await ctx.db.delete(id);
    return { status: 200, message: "Item deleted" };
  },
});

export const main_page_most_orders = query({
  handler: async (ctx) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_orders")
      .order("desc")
      .take(3);

    return { items, status: 200 };
  },
});

export const main_page_on_sale = query({
  handler: async (ctx) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_sale")
      .order("desc")
      .take(3);

    return { items, status: 200 };
  },
});

export const main_page_new_comers = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").order("desc").take(3);

    return { items, status: 200 };
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

export const catalog_query_based_on_category_and_filter = query({
  args: {
    category: v.id("categorys"),
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Со скидкой"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, filter, paginationOpts }) => {
    if (filter === "Хиты продаж") {
      return await ctx.db
        .query("items")
        .withIndex("by_category_orders", (q) => q.eq("category", category))
        .order("desc")
        .paginate(paginationOpts);
    }
    if (filter === "Новинки") {
      return await ctx.db
        .query("items")
        .withIndex("by_category", (q) => q.eq("category", category))
        .order("desc")
        .paginate(paginationOpts);
    }
    // "Со скидкой"
    return await ctx.db
      .query("items")
      .withIndex("by_category_sale", (q) => q.eq("category", category))
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const show_all_categories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categorys").collect();
    return { categories, status: 200 };
  },
});

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

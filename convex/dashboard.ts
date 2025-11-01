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
    partNumber: v.optional(v.string()),
    collection: v.optional(v.string()),
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
      partNumber,
      collection,
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
      partNumber: partNumber ?? undefined,
      collection: collection ?? undefined,
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

// New: fetch a single item by Convex id. Returns the doc or null if not found.
export const show_item = query({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    return doc ?? null;
  },
});

// Fetch related items by brand and collection (excluding the current item)
export const show_items_by_brand_and_collection = query({
  args: {
    itemId: v.id("items"),
    brand: v.optional(v.string()),
    collection: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, brand, collection }) => {
    // If no collection is provided, return empty array
    if (!collection) {
      return [];
    }

    // Query all items with matching brand and collection, excluding current item
    const items = await ctx.db
      .query("items")
      .filter((q) =>
        q.and(
          q.eq(q.field("brand"), brand),
          q.eq(q.field("collection"), collection),
          q.neq(q.field("_id"), itemId),
        ),
      )
      .collect();

    return items;
  },
});

// Update only the images of an item, enforcing order and cleaning up removed storage objects.
// - Persists imagesUrls and imageStorageIds in the provided order
// - Deletes storage objects that are no longer referenced
// - Validates max 15 images
export const update_item_images = mutation({
  args: {
    itemId: v.id("items"),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    imagesUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { itemId, imageStorageIds, imagesUrls }) => {
    const existing = await ctx.db.get(itemId);
    if (!existing) throw new Error("Item not found");

    // Determine next arrays (order is authoritative)
    const nextStorageIds = imageStorageIds ?? existing.imageStorageIds ?? [];
    if (nextStorageIds.length > 15) {
      throw new Error("Максимум 15 изображений");
    }

    let nextUrls = imagesUrls ?? existing.imagesUrls ?? [];
    // If URLs not provided or sizes mismatch, regenerate from storage ids
    if (!imagesUrls || imagesUrls.length !== nextStorageIds.length) {
      const urls = await Promise.all(
        nextStorageIds.map((sid) => ctx.storage.getUrl(sid)),
      );
      nextUrls = urls.map((u) => u ?? "/not-found.jpg");
    }

    // Cleanup: delete storage ids that are no longer referenced
    const oldStorageIds = existing.imageStorageIds ?? [];
    const nextSet = new Set(nextStorageIds.map((sid) => sid.toString()));
    const toDelete = oldStorageIds.filter((sid) => !nextSet.has(sid.toString()));
    if (toDelete.length) {
      await Promise.all(toDelete.map((sid) => ctx.storage.delete(sid)));
    }

    await ctx.db.patch(itemId, {
      imageStorageIds: nextStorageIds.length ? nextStorageIds : undefined,
      imagesUrls: nextUrls.length ? nextUrls : undefined,
    });
    return { status: 200, message: "Item images updated" };
  },
});

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
    subcategory: v.optional(v.id("subcategorys")),
    brand: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, filter, subcategory, brand, paginationOpts }) => {
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

    // Apply brand filter if provided
    if (brand !== undefined && brand !== null) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("brand"), brand),
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

/**
 * Get items grouped by collection for a given category and filter
 * Returns one representative item per collection with variant count and price range
 */
export const catalog_query_grouped_by_collection = query({
  args: {
    category: v.id("categorys"),
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Со скидкой"),
    ),
    subcategory: v.optional(v.id("subcategorys")),
    brand: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, filter, subcategory, brand, paginationOpts }) => {
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

    // Apply brand filter if provided
    if (brand !== undefined && brand !== null) {
      queryBuilder = queryBuilder.filter((q) =>
        q.eq(q.field("brand"), brand),
      );
    }

    const allItems = await queryBuilder.order("desc").collect();

    // Group by collection (brand + collection)
    const collectionMap = new Map<
      string,
      Array<(typeof allItems)[number]>
    >();

    for (const item of allItems) {
      // Create a unique key for each collection (brand + collection name)
      const collectionKey = item.collection
        ? `${item.brand || "no-brand"}_${item.collection}`
        : `no-collection-${item._id}`;

      if (!collectionMap.has(collectionKey)) {
        collectionMap.set(collectionKey, []);
      }
      collectionMap.get(collectionKey)!.push(item);
    }

    // Build result with one representative item per collection
    const groupedResults = [];

    for (const [, items] of collectionMap.entries()) {
      // Sort items by price to get consistent representative
      items.sort((a, b) => a.price - b.price);

      const representative = items[0];
      const prices = items.map((item) => item.price);
      const variants = items.map((item) => parseFloat(item.variant) || 0);

      groupedResults.push({
        ...representative,
        variantsCount: items.length,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        variantRange:
          items.length > 1
            ? {
              min: Math.min(...variants),
              max: Math.max(...variants),
            }
            : undefined,
      });
    }

    // Sort grouped results by creation time (descending for "Новинки")
    groupedResults.sort((a, b) => b._creationTime - a._creationTime);

    // Manually paginate the grouped results
    const numItems = paginationOpts.numItems;
    const cursor = paginationOpts.cursor;

    let startIndex = 0;
    if (cursor !== null) {
      // Parse cursor to get the starting index
      startIndex = parseInt(cursor, 10) || 0;
    }

    const page = groupedResults.slice(startIndex, startIndex + numItems);
    const isDone = startIndex + numItems >= groupedResults.length;
    const continueCursor = (startIndex + numItems).toString();

    return {
      page,
      isDone,
      continueCursor,
    };
  },
});

/**
 * Get all items in a specific collection
 */
export const get_items_by_collection = query({
  args: {
    brand: v.optional(v.string()),
    collection: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("items"),
      _creationTime: v.number(),
      name: v.string(),
      brand: v.optional(v.string()),
      collection: v.optional(v.string()),
      variant: v.string(),
      price: v.number(),
      quantity: v.number(),
      rating: v.optional(v.number()),
      imagesUrls: v.optional(v.array(v.string())),
      category: v.optional(v.id("categorys")),
      subcategory: v.optional(v.id("subcategorys")),
      description: v.string(),
      lowerCaseName: v.string(),
      partNumber: v.optional(v.string()),
      imageStorageIds: v.optional(v.array(v.id("_storage"))),
      orders: v.optional(v.number()),
      sale: v.optional(v.number()),
      color: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  ),
  handler: async (ctx, args) => {
    if (!args.brand || !args.collection) {
      return [];
    }

    const items = await ctx.db
      .query("items")
      .filter((q) =>
        q.and(
          q.eq(q.field("brand"), args.brand),
          q.eq(q.field("collection"), args.collection),
        ),
      )
      .collect();

    // Sort by variant (ascending)
    return items.sort((a, b) => {
      const variantA = parseFloat(a.variant) || 0;
      const variantB = parseFloat(b.variant) || 0;
      return variantA - variantB;
    });
  },
});
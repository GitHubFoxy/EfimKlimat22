import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// CATALOG NAVIGATION & LISTING

// List all visible categories for catalog navigation
export const catalog_list_all_categories = query({
  args: {},
  handler: async (ctx) => {
    // Get all visible categories, ordered by parent and order
    const categories = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isVisible"), true))
      .order("asc")
      .collect();

    // Build hierarchy: group by parent
    const topLevel = categories.filter((c) => !c.parentId);
    return topLevel;
  },
});

// Get subcategories by parent category
export const show_subcategories_by_category = query({
  args: {
    parent: v.id("categories"),
  },
  handler: async (ctx, { parent }) => {
    const subcategories = await ctx.db
      .query("categories")
      .withIndex("by_parent_order", (q) => q.eq("parentId", parent))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .collect();

    return {
      subcategories,
    };
  },
});

// FILTERING & QUERYING

// Get all active brands for filtering
export const show_all_brands = query({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db
      .query("brands")
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("asc")
      .collect();

    return brands;
  },
});

// Query items based on category and filter type with pagination
export const catalog_query_based_on_category_and_filter = query({
  args: {
    category: v.id("categories"),
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Со скидкой"),
    ),
    brand: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, filter, brand, paginationOpts }) => {
    const itemsQuery = ctx.db
      .query("items")
      .filter((q) => {
        let conditions = [
          q.eq(q.field("categoryId"), category),
          q.eq(q.field("status"), "active"),
          q.eq(q.field("inStock"), true),
        ];

        // Add discount filter if needed
        if (filter === "Со скидкой") {
          conditions.push(q.gt(q.field("discountAmount"), 0));
        }

        // Add brand filter if provided
        if (brand) {
          conditions.push(q.eq(q.field("brandId"), brand as any));
        }

        return q.and(...conditions);
      })
      .order("desc");

    // Paginate results
    const paginatedItems = await itemsQuery.paginate(paginationOpts);

    // Fetch brand details for each item
    const itemsWithBrands = await Promise.all(
      paginatedItems.page.map(async (item) => {
        const brand = await ctx.db.get(item.brandId);
        return {
          ...item,
          brandName: brand?.name || "Неизвестно",
        };
      }),
    );

    return {
      ...paginatedItems,
      page: itemsWithBrands,
    };
  },
});

// Query items grouped by collection (subcategory/category)
export const catalog_query_grouped_by_collection = query({
  args: {
    category: v.id("categories"),
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Со скидкой"),
    ),
    brand: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, filter, brand, paginationOpts }) => {
    // Get all items for this category with filters applied
    const itemsQuery = ctx.db
      .query("items")
      .filter((q) => {
        let conditions = [
          q.eq(q.field("categoryId"), category),
          q.eq(q.field("status"), "active"),
          q.eq(q.field("inStock"), true),
        ];

        // Add discount filter if needed
        if (filter === "Со скидкой") {
          conditions.push(q.gt(q.field("discountAmount"), 0));
        }

        // Add brand filter if provided
        if (brand) {
          conditions.push(q.eq(q.field("brandId"), brand as any));
        }

        return q.and(...conditions);
      })
      .order("desc");

    // Get paginated results
    const paginatedItems = await itemsQuery.paginate(paginationOpts);

    // Fetch brand details for each item
    const itemsWithBrands = await Promise.all(
      paginatedItems.page.map(async (item) => {
        const brand = await ctx.db.get(item.brandId);
        return {
          ...item,
          brandName: brand?.name || "Неизвестно",
        };
      }),
    );

    return {
      ...paginatedItems,
      page: itemsWithBrands,
    };
  },
});

// PRODUCT DETAILS

// Get single item by ID with all details
export const show_item = query({
  args: {
    id: v.id("items"),
  },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) return null;

    // Fetch brand details
    const brand = await ctx.db.get(item.brandId);

    return {
      ...item,
      brandName: brand?.name || "Неизвестно",
    };
  },
});

// Get single item by slug with all details
export const show_item_by_slug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const item = await ctx.db
      .query("items")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!item) return null;

    // Fetch brand details
    const brand = await ctx.db.get(item.brandId);

    return {
      ...item,
      brandName: brand?.name || "Неизвестно",
    };
  },
});

// Get items by brand and category (related items for product page)
export const show_items_by_brand_and_collection = query({
  args: {
    itemId: v.id("items"),
    brandId: v.id("brands"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, { itemId, brandId, categoryId }) => {
    // Get items from same brand and category, excluding the current item
    const relatedItems = await ctx.db
      .query("items")
      .filter((q) =>
        q.and(
          q.eq(q.field("brandId"), brandId),
          q.eq(q.field("categoryId"), categoryId),
          q.eq(q.field("status"), "active"),
          q.eq(q.field("inStock"), true),
          q.neq(q.field("_id"), itemId),
        ),
      )
      .take(8);

    return relatedItems;
  },
});

import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// UTILITY: Get all descendant category IDs (for hierarchical filtering)
async function getDescendantCategoryIds(
  ctx: any,
  rootId: Id<"categories">,
): Promise<Id<"categories">[]> {
  const allCategories = await ctx.db.query("categories").collect();

  const descendants = new Set<Id<"categories">>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const cat of allCategories) {
      if (
        cat.parentId &&
        descendants.has(cat.parentId) &&
        !descendants.has(cat._id)
      ) {
        descendants.add(cat._id);
        changed = true;
      }
    }
  }

  return Array.from(descendants);
}

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
    category: v.optional(v.id("categories")),
    filter: v.union(
      v.literal("Хиты продаж"),
      v.literal("Новинки"),
      v.literal("Со скидкой"),
    ),
    brand: v.optional(v.id("brands")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { category, filter, brand, paginationOpts }) => {
    // Get descendant category IDs if category is selected (for hierarchical filtering)
    let categoryIds: Id<"categories">[] | undefined;
    if (category) {
      categoryIds = await getDescendantCategoryIds(ctx, category);
    }

    const itemsQuery = ctx.db
      .query("items")
      .filter((q) => {
        const conditions = [
          q.eq(q.field("status"), "active"),
          q.eq(q.field("inStock"), true),
        ];

        if (categoryIds && categoryIds.length > 0) {
          // Create OR condition for multiple category IDs (includes parent and all descendants)
          const categoryConditions = categoryIds.map((catId) =>
            q.eq(q.field("categoryId"), catId),
          );
          conditions.push(
            categoryConditions.length === 1
              ? categoryConditions[0]
              : q.or(...categoryConditions),
          );
        }

        if (filter === "Со скидкой") {
          conditions.push(q.gt(q.field("discountAmount"), 0));
        }

        if (brand) {
          conditions.push(q.eq(q.field("brandId"), brand));
        }

        return q.and(...conditions);
      })
      .order("desc");

    // Paginate results
    const paginatedItems = await itemsQuery.paginate(paginationOpts);

    // Fetch brand details for each item
    const itemsWithBrands = await Promise.all(
      paginatedItems.page.map(async (item) => {
        if (!item.brandId) {
          return {
            ...item,
            brandName: "Неизвестно",
          };
        }
        const brand = await ctx.db.get(item.brandId);
        const brandName = (brand && 'name' in brand) ? (brand.name as string) : "Неизвестно";
        return {
          ...item,
          brandName,
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
     category: v.optional(v.id("categories")),
     filter: v.union(
       v.literal("Хиты продаж"),
       v.literal("Новинки"),
       v.literal("Со скидкой"),
     ),
     brand: v.optional(v.id("brands")),
     paginationOpts: paginationOptsValidator,
   },
   handler: async (ctx, { category, filter, brand, paginationOpts }) => {
     // Get descendant category IDs if category is selected
     let categoryIds: Id<"categories">[] | undefined;
     if (category) {
       categoryIds = await getDescendantCategoryIds(ctx, category);
     }

     let groupsQuery = ctx.db.query("collectionGroups");

     // Filter by categories
     if (categoryIds && categoryIds.length > 0) {
       groupsQuery = groupsQuery.filter((q) => {
         const cats = categoryIds!.map((id) => q.eq(q.field("categoryId"), id));
         return cats.length === 1 ? cats[0] : q.or(...cats);
       });
     }

     // Filter by brand
     if (brand) {
       groupsQuery = groupsQuery.filter((q) =>
         q.eq(q.field("brandId"), brand),
       );
     }

     // Filter by discount flag
     if (filter === "Со скидкой") {
       groupsQuery = groupsQuery.filter((q) =>
         q.eq(q.field("hasDiscount"), true),
       );
     }

     // Order and paginate
     const paginatedGroups = await groupsQuery.order("desc").paginate(paginationOpts);

     // Attach representative item + brandName for each group
     const pageWithItems = await Promise.all(
       paginatedGroups.page.map(async (group) => {
         const item = await ctx.db.get(group.representativeItemId);
         if (!item) return null;

         let brandName = "Неизвестно";
         if (item.brandId) {
           const brandDoc = await ctx.db.get(item.brandId);
           if (brandDoc && "name" in brandDoc) {
             brandName = brandDoc.name as string;
           }
         }

         return {
           ...item,
           brandName,
           variantsCount: group.variantsCount,
           priceRange: { min: group.priceMin, max: group.priceMax },
           collection: group.collection,
         };
       }),
     );

     return {
       ...paginatedGroups,
       page: pageWithItems.filter((x): x is any => x !== null),
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
    let brandName = "Неизвестно";
    if (item.brandId) {
      const brand = await ctx.db.get(item.brandId);
      if (brand && 'name' in brand) {
        brandName = brand.name as string;
      }
    }

    return {
      ...item,
      brandName,
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
    let brandName = "Неизвестно";
    if (item.brandId) {
      const brand = await ctx.db.get(item.brandId);
      if (brand && 'name' in brand) {
        brandName = brand.name as string;
      }
    }

    // Fetch variant count from collection group
    let variantsCount: number | undefined;
    if (item.brandId && item.categoryId && item.collection) {
      const group = await ctx.db
        .query("collectionGroups")
        .withIndex("by_category_brand", (q) =>
          q.eq("categoryId", item.categoryId!)
            .eq("brandId", item.brandId!)
        )
        .filter((q) => q.eq(q.field("collection"), item.collection!))
        .first();
      variantsCount = group?.variantsCount;
    }

    return {
      ...item,
      brandName,
      variantsCount,
    };
  },
});

// Get items by brand, category, and collection (related items for product page)
export const show_items_by_brand_and_collection = query({
   args: {
     itemId: v.id("items"),
     brandId: v.id("brands"),
     categoryId: v.id("categories"),
     collection: v.optional(v.string()),
   },
   handler: async (ctx, { itemId, brandId, categoryId, collection }) => {
     // If collection is provided, get all variants in that collection
     // Otherwise fall back to brand+category grouping
     let query = ctx.db
       .query("items")
       .filter((q) =>
         q.and(
           q.eq(q.field("brandId"), brandId),
           q.eq(q.field("categoryId"), categoryId),
           q.eq(q.field("status"), "active"),
           q.eq(q.field("inStock"), true),
           q.neq(q.field("_id"), itemId),
         ),
       );

     // If collection is provided, add collection filter
     if (collection) {
       query = query.filter((q) => q.eq(q.field("collection"), collection));
     }

     const relatedItems = await query.take(8);
     return relatedItems;
   },
 });

// Get variant count for an item (items with same brand and category)
export const get_variant_count = query({
  args: {
    brandId: v.id("brands"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, { brandId, categoryId }) => {
    const items = await ctx.db
      .query("items")
      .filter((q) =>
        q.and(
          q.eq(q.field("brandId"), brandId),
          q.eq(q.field("categoryId"), categoryId),
          q.eq(q.field("status"), "active"),
          q.eq(q.field("inStock"), true),
        ),
      )
      .collect();

    return items.length;
  },
});

// Get brands that have items in a specific category (including subcategories)
export const catalog_brands_by_category = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, { categoryId }) => {
    // Get all descendant category IDs for hierarchical filtering
    const categoryIds = await getDescendantCategoryIds(ctx, categoryId);

    // 1. Get all items in this category and subcategories
    const items = await ctx.db
      .query("items")
      .filter((q) => {
        const categoryConditions = categoryIds.map((catId) =>
          q.eq(q.field("categoryId"), catId),
        );
        return q.and(
          categoryConditions.length === 1
            ? categoryConditions[0]
            : q.or(...categoryConditions),
          q.eq(q.field("status"), "active"),
          q.eq(q.field("inStock"), true),
        );
      })
      .collect();

    // 2. Extract unique brand IDs (filter out undefined)
    const brandIdSet = new Set<Id<"brands">>();
    items.forEach((i) => {
      if (i.brandId) {
        brandIdSet.add(i.brandId);
      }
    });

    // 3. Fetch brand details
    const brands = await Promise.all(
      Array.from(brandIdSet).map(async (id) => {
        const brand = await ctx.db.get(id);
        return brand;
      }),
    );

    return brands.filter((b): b is any => b !== null && 'status' in b && b.status === "active");
  },
});

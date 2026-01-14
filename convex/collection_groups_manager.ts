import { MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Recompute and update collection group when an item is created/updated/deleted
 * This keeps the collectionGroups table in sync with items table
 * Note: Must be called from mutation context
 */
export async function upsertCollectionGroup(
  ctx: MutationCtx,
  item: Doc<"items">,
): Promise<void> {
  // Only process items with required fields for grouping
  if (!item.brandId || !item.categoryId || !item.collection) return;

  // Get all active, in-stock items in this collection group
  const itemsInGroup = await ctx.db
    .query("items")
    .withIndex("by_category_brand_collection", (q: any) =>
      q
        .eq("categoryId", item.categoryId!)
        .eq("brandId", item.brandId!)
        .eq("status", "active")
        .eq("collection", item.collection!),
    )
    .filter((q: any) => q.eq(q.field("inStock"), true))
    .collect();

  // Check if any item in the group has a discount
  const hasDiscount = itemsInGroup.some((i: Doc<"items">) => (i.discountAmount ?? 0) > 0);

  // If no items remain, delete the group
  if (itemsInGroup.length === 0) {
    const existing = await ctx.db
      .query("collectionGroups")
      .withIndex("by_category_brand", (q: any) =>
        q
          .eq("categoryId", item.categoryId!)
          .eq("brandId", item.brandId!),
      )
      .filter((q: any) => q.eq(q.field("collection"), item.collection!))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return;
  }

  // Calculate price range
  const priceMin = Math.min(...itemsInGroup.map((i: Doc<"items">) => i.price));
  const priceMax = Math.max(...itemsInGroup.map((i: Doc<"items">) => i.price));

  // Select representative item (prefer first, but could be cheapest or best-seller)
  const representative = itemsInGroup[0];

  // Find existing collection group
  const existing = await ctx.db
    .query("collectionGroups")
    .withIndex("by_category_brand", (q: any) =>
      q
        .eq("categoryId", item.categoryId!)
        .eq("brandId", item.brandId!),
    )
    .filter((q: any) => q.eq(q.field("collection"), item.collection!))
    .first();

  if (existing) {
    // Update existing group
    await ctx.db.patch(existing._id, {
      variantsCount: itemsInGroup.length,
      priceMin,
      priceMax,
      hasDiscount,
      representativeItemId: representative._id,
      primaryImageUrl: representative.imagesUrl?.[0],
      representativeSlug: representative.slug,
    });
  } else {
    // Create new group
    await ctx.db.insert("collectionGroups", {
      categoryId: item.categoryId!,
      brandId: item.brandId!,
      collection: item.collection!,
      variantsCount: itemsInGroup.length,
      priceMin,
      priceMax,
      hasDiscount,
      representativeItemId: representative._id,
      primaryImageUrl: representative.imagesUrl?.[0],
      representativeSlug: representative.slug,
    });
  }
}

/**
 * Delete collection group when item is deleted
 * Note: Must be called from mutation context
 */
export async function deleteCollectionGroupIfEmpty(
  ctx: MutationCtx,
  item: Doc<"items">,
): Promise<void> {
  if (!item.brandId || !item.categoryId || !item.collection) return;

  // Check if any items remain in this group
  const itemsInGroup = await ctx.db
    .query("items")
    .withIndex("by_category_brand_collection", (q: any) =>
      q
        .eq("categoryId", item.categoryId!)
        .eq("brandId", item.brandId!)
        .eq("status", "active")
        .eq("collection", item.collection!),
    )
    .filter((q: any) => q.eq(q.field("inStock"), true))
    .collect();

  // If empty, delete the group
  if (itemsInGroup.length === 0) {
    const existing = await ctx.db
      .query("collectionGroups")
      .withIndex("by_category_brand", (q: any) =>
        q
          .eq("categoryId", item.categoryId!)
          .eq("brandId", item.brandId!),
      )
      .filter((q: any) => q.eq(q.field("collection"), item.collection!))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  }
}

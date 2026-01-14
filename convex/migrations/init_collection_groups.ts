/**
 * Migration: Initialize collectionGroups table from items
 * Backfills collection groups with statistics from all items
 * 
 * Usage in convex console:
 * npx convex run migrations/init_collection_groups.ts
 */

import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const init_collection_groups = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();

    // Group items by brandId, categoryId, and collection
    const groups = new Map<
      string,
      {
        brandId: Id<"brands">;
        categoryId: Id<"categories">;
        collection: string;
        itemsInGroup: typeof items;
      }
    >();

    for (const item of items) {
      // Only process active, in-stock items with required fields
      if (
        item.status !== "active" ||
        !item.inStock ||
        !item.brandId ||
        !item.categoryId ||
        !item.collection
      ) {
        continue;
      }

      const key = `${item.brandId}:${item.categoryId}:${item.collection}`;

      if (!groups.has(key)) {
        groups.set(key, {
          brandId: item.brandId,
          categoryId: item.categoryId,
          collection: item.collection,
          itemsInGroup: [],
        });
      }

      groups.get(key)!.itemsInGroup.push(item);
    }

    // Create collection group documents
    let created = 0;
    for (const [, group] of groups) {
      if (group.itemsInGroup.length === 0) continue;

      const priceMin = Math.min(...group.itemsInGroup.map((i) => i.price));
      const priceMax = Math.max(...group.itemsInGroup.map((i) => i.price));
      const hasDiscount = group.itemsInGroup.some((i) => (i.discountAmount ?? 0) > 0);
      const representative = group.itemsInGroup[0];

      await ctx.db.insert("collectionGroups", {
        categoryId: group.categoryId,
        brandId: group.brandId,
        collection: group.collection,
        variantsCount: group.itemsInGroup.length,
        priceMin,
        priceMax,
        hasDiscount,
        representativeItemId: representative._id,
        primaryImageUrl: representative.imagesUrl?.[0],
        representativeSlug: representative.slug,
      });

      created++;
    }

    console.log(`Created ${created} collection groups`);
    return { created };
  },
});

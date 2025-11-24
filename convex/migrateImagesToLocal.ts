import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// Query to find all items with Convex cloud URLs
export const findItemsWithConvexUrls = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("items").collect();

    const itemsWithConvexUrls = allItems.filter((item) => {
      if (!item.imagesUrls || item.imagesUrls.length === 0) return false;

      // Check if any URL contains the Convex cloud domain
      return item.imagesUrls.some((url) =>
        url.includes("accurate-rabbit-307.convex.cloud")
      );
    });

    return {
      total: itemsWithConvexUrls.length,
      items: itemsWithConvexUrls.map((item) => ({
        _id: item._id,
        name: item.name,
        currentUrls: item.imagesUrls,
      })),
    };
  },
});

// Mutation to migrate a single item's image URLs
export const migrateItemUrls = internalMutation({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    if (!item.imagesUrls || item.imagesUrls.length === 0) {
      return { status: "skipped", reason: "no images" };
    }

    // Replace the domain in each URL
    const updatedUrls = item.imagesUrls.map((url) => {
      if (url.includes("accurate-rabbit-307.convex.cloud")) {
        return url.replace(
          "accurate-rabbit-307.convex.cloud",
          "212.67.9.127:3210"
        );
      }
      return url;
    });

    // Check if any URLs were actually changed
    const hasChanges = updatedUrls.some((url, index) => url !== item.imagesUrls![index]);

    if (hasChanges) {
      await ctx.db.patch(itemId, { imagesUrls: updatedUrls });
      return {
        status: "updated",
        itemId,
        oldUrls: item.imagesUrls,
        newUrls: updatedUrls,
      };
    }

    return { status: "no_changes", itemId };
  },
});

// Main migration function that processes all items
export const migrateAllImages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("items").collect();

    const results = {
      total: allItems.length,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ itemId: string; error: string }>,
    };

    for (const item of allItems) {
      try {
        if (!item.imagesUrls || item.imagesUrls.length === 0) {
          results.skipped++;
          continue;
        }

        // Check if this item has Convex cloud URLs
        const hasConvexUrls = item.imagesUrls.some((url) =>
          url.includes("http")
        );

        if (!hasConvexUrls) {
          results.skipped++;
          continue;
        }

        // Replace the domain in each URL
        const updatedUrls = item.imagesUrls.map((url) => {
          if (url.includes("htt")) {
            return url.replace(
              "https://212.67.9.127:3210",
              "https://api.klimat22.com"
            );
          }
          return url;
        });

        await ctx.db.patch(item._id, { imagesUrls: updatedUrls });
        results.updated++;
      } catch (error) {
        results.errors.push({
          itemId: item._id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  },
});

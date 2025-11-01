import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Batch-insert items using existing dashboard.addItemsPublic mutation.
// Note: This action expects images to already be uploaded to Convex storage
// and provided as imageStorageIds. The action does NOT perform image
// conversion or file system access — that should be done client-side or via a
// local script, then call this action to persist items in the DB.
export const seedInsertItems = action({
  args: {
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        description: v.string(),
        brand: v.optional(v.string()),
        variant: v.optional(v.string()),
        category: v.optional(v.id("categorys")),
        subcategory: v.optional(v.string()),
        partNumber: v.optional(v.string()),
        imageStorageIds: v.optional(v.array(v.id("_storage"))),
      }),
    ),
  },
  handler: async (ctx, { items }) => {
    for (const item of items) {
      await ctx.runMutation(api.dashboard.addItemsPublic, {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        description: item.description,
        brand: item.brand,
        variant: item.variant,
        category: item.category,
        subcategory: item.subcategory,
        partNumber: item.partNumber,
        imageStorageIds: item.imageStorageIds,
      });
    }
    return { status: 200, message: `Seeded ${items.length} items` };
  },
});
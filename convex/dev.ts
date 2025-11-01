import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

// export const addItems = internalMutation({
//   args: {
//     name: v.string(),
//     image: v.optional(v.string()),
//     imageStorageId: v.optional(v.id("_storage")),
//     quantity: v.number(),
//     price: v.number(),
//     description: v.string(),
//     rating: v.optional(v.number()),
//     orders: v.optional(v.number()),
//     category: v.optional(v.id("categorys")),
//     sale: v.optional(v.number()),
//   },
//   handler: async (
//     ctx,
//     {
//       name,
//       image = "/not-found.jpg",
//       imageStorageId,
//       quantity = 1,
//       price,
//       description = "",
//       rating = 0,
//       orders = 0,
//       category,
//       sale = 0,
//     },
//   ) => {
//     let imageUrl = image;
//     if (imageStorageId) {
//       const url = await ctx.storage.getUrl(imageStorageId);
//       imageUrl = url ?? "/not-found.jpg";
//     }
//     await ctx.db.insert("items", {
//       name,
//       lowerCaseName: name.toLowerCase(),
//       image: imageUrl,
//       imageStorageId,
//       quantity,
//       description,
//       price,
//       rating,
//       orders,
//       category,
//       sale,
//     });
//     return { status: 200, message: "Item added" };
//   },
// });

export const addCategory = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    await ctx.db.insert("categorys", { name });
    return { status: 200, message: "Category added" };
  },
});

export const addSubcategory = internalMutation({
  args: {
    parentCategory: v.id("categorys"),
    subcategoryName: v.string(),
  },
  handler: async (ctx, { parentCategory, subcategoryName }) => {
    await ctx.db.insert("subcategorys", {
      parent: parentCategory,
      name: subcategoryName,
    });
    return { status: 200, message: "Subcategory added" };
  },
});

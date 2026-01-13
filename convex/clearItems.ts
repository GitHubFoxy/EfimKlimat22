import { mutation } from "./_generated/server";

export const clearItems = mutation(async (ctx) => {
  const items = await ctx.db.query("items").collect();
  for (const item of items) {
    await ctx.db.delete(item._id);
  }
  return { deleted: items.length };
});

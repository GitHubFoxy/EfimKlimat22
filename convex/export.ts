import { query } from "./_generated/server";

export const getAllItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("items").collect();
  },
});

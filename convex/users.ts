import { v } from "convex/values";
import { query } from "./_generated/server";

// List all users (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// List active users
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("status"), "blocked"))
      .collect();
  },
});

// List blocked users
export const listBlocked = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("status"), "blocked"))
      .collect();
  },
});

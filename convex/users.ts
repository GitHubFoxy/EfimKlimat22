import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create_user_with_role = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("manager"),
      v.literal("admin"),
    ),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", args);
    return id;
  },
});

export const list_users_by_role = query({
  args: {
    role: v.union(
      v.literal("user"),
      v.literal("manager"),
      v.literal("admin"),
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.string(),
      phone: v.string(),
      password: v.optional(v.string()),
      role: v.union(
        v.literal("user"),
        v.literal("manager"),
        v.literal("admin"),
      ),
    }),
  ),
  handler: async (ctx, { role }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", role))
      .collect();
  },
});
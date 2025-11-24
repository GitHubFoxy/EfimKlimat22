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

// Fetch a single user document by id
export const get_user_by_id = query({
  args: { id: v.id("users") },

  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    return doc ?? null;
  },
});

// Update user fields (admin only usage in UI)
export const update_user = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("user"), v.literal("manager"), v.literal("admin")),
    ),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("User not found");
    await ctx.db.patch(id, patch);
    return { status: 200 };
  },
});

// Delete user (admin only)
export const delete_user = mutation({
  args: { id: v.id("users") },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { status: 200 };
  },
});

import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import {
  getAuthUserId,
  createAccount,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("status"), "blocked"))
      .collect();
  },
});

export const listBlocked = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("status"), "blocked"))
      .collect();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const clearTempPasswordInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { tempPassword: undefined });
  },
});

export const createManager = action({
  args: {
    phone: v.string(),
    name: v.string(),
    surname: v.optional(v.string()),
  },
  handler: async (ctx, { phone, name, surname }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("Not authenticated");
    }

    const currentUser = await ctx.runQuery(api.users.getCurrentUser);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("Only admins can create managers");
    }

    const tempPassword = generateTempPassword();

    try {
      await createAccount(ctx, {
        provider: "password",
        account: { id: phone, secret: tempPassword },
        profile: {
          phone,
          name,
          surname,
          role: "manager",
          tempPassword,
          status: "active",
        },
      });
    } catch (e) {
      throw new ConvexError(
        "Failed to create manager account. User might already exist.",
      );
    }

    return { phone, tempPassword };
  },
});

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { currentPassword, newPassword }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) {
      throw new ConvexError("User not found");
    }

    if (!user.tempPassword) {
      throw new ConvexError("No temporary password set for this user");
    }

    if (currentPassword !== user.tempPassword) {
      throw new ConvexError("Invalid current password");
    }

    if (newPassword.length < 6) {
      throw new ConvexError("New password must be at least 6 characters");
    }

    if (!user.phone) {
      throw new ConvexError("User phone not found");
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: user.phone, secret: newPassword },
    });

    await ctx.runMutation(internal.users.clearTempPasswordInternal, { userId });

    return { success: true };
  },
});

// Create a user with role (for admin panel)
export const create_user_with_role = action({
  args: {
    name: v.string(),
    phone: v.string(),
    role: v.union(v.literal("user"), v.literal("manager"), v.literal("admin")),
  },
  handler: async (ctx, { name, phone, role }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("Not authenticated");
    }

    const currentUser = await ctx.runQuery(api.users.getCurrentUser);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("Only admins can create users");
    }

    const tempPassword = generateTempPassword();

    try {
      await createAccount(ctx, {
        provider: "password",
        account: { id: phone, secret: tempPassword },
        profile: {
          phone,
          name,
          role,
          tempPassword,
          status: "active",
        },
      });
    } catch (e) {
      throw new ConvexError(
        "Failed to create user account. User might already exist.",
      );
    }

    return { phone, tempPassword };
  },
});

// Update user (for admin panel)
export const update_user = mutation({
  args: {
    id: v.id("users"),
    name: v.string(),
    phone: v.string(),
    role: v.union(v.literal("user"), v.literal("manager"), v.literal("admin")),
  },
  handler: async (ctx, { id, name, phone, role }) => {
    await ctx.db.patch(id, { name, phone, role });
    return { success: true };
  },
});

// Delete user (for admin panel)
export const delete_user = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

// List users by role (for admin panel)
export const list_users_by_role = query({
  args: {
    role: v.union(v.literal("user"), v.literal("manager"), v.literal("admin")),
  },
  handler: async (ctx, { role }) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), role))
      .collect();
  },
});

// Get user by ID
export const get_user_by_id = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Register a manager user (DX-simple). If a user with the same phone exists, return it; otherwise create.
export const register_manager = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    password: v.optional(v.string()),
  },
  returns: v.object({ status: v.number(), userId: v.id("users") }),
  handler: async (ctx, { name, phone, password }) => {
    // Try to find existing user by phone
    const existing = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique();
    if (existing) {
      // Ensure role is manager for DX
      if (existing.role !== "manager") {
        await ctx.db.patch(existing._id, { role: "manager" });
      }
      return { status: 200, userId: existing._id };
    }
    const userId = await ctx.db.insert("users", {
      name,
      phone,
      role: "manager",
      ...(password ? { password } : {}),
    });
    return { status: 200, userId };
  },
});

// Login a manager user by phone. Returns a simple token and userId.
export const login_manager = mutation({
  args: {
    phone: v.string(),
    password: v.optional(v.string()),
  },
  returns: v.object({ token: v.string(), userId: v.id("users") }),
  handler: async (ctx, { phone, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "manager") {
      throw new Error("Not a manager user");
    }
    // If a password is set on the user, require it; otherwise allow phone-only login.
    if (user.password && user.password !== password) {
      throw new Error("Invalid password");
    }
    // For DX simplicity, use the user's id as a token
    return { token: user._id, userId: user._id };
  },
});
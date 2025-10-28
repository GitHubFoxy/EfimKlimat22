import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List orders for managers by status, newest first by updatedAt/_creationTime
export const list_orders_by_status = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("orders"),
        _creationTime: v.number(),
        userId: v.id("users"),
        updatedAt: v.optional(v.number()),
        assignedManager: v.optional(v.id("users")),
        itemId: v.array(v.id("items")),
        status: v.union(
          v.literal("pending"),
          v.literal("processing"),
          v.literal("done"),
        ),
        total: v.number(),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    // New fields returned by Convex pagination in recent versions
    pageStatus: v.optional(v.union(v.string(), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, { status, paginationOpts }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status_and_updatedAt", (q) => q.eq("status", status))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Update order status (manager/admin)
export const update_order_status = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
    ),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { orderId, status }) => {
    const existing = await ctx.db.get(orderId);
    if (!existing) throw new Error("Order not found");
    await ctx.db.patch(orderId, { status, updatedAt: Date.now() });
    return { status: 200 };
  },
});

// List only orders assigned to a specific manager by status
export const list_my_orders_by_status = query({
  args: {
    managerId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("orders"),
        _creationTime: v.number(),
        userId: v.id("users"),
        updatedAt: v.optional(v.number()),
        assignedManager: v.optional(v.id("users")),
        itemId: v.array(v.id("items")),
        status: v.union(
          v.literal("pending"),
          v.literal("processing"),
          v.literal("done"),
        ),
        total: v.number(),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    // New fields returned by Convex pagination in recent versions
    pageStatus: v.optional(v.union(v.string(), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, { managerId, status, paginationOpts }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_assignedManager_status_updatedAt", (q) =>
        q.eq("assignedManager", managerId).eq("status", status),
      )
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Claim an order to a manager (set assignedManager)
export const claim_order = mutation({
  args: {
    orderId: v.id("orders"),
    managerId: v.id("users"),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { orderId, managerId }) => {
    const existing = await ctx.db.get(orderId);
    if (!existing) throw new Error("Order not found");
    await ctx.db.patch(orderId, {
      assignedManager: managerId,
      updatedAt: Date.now(),
    });
    return { status: 200 };
  },
});

// Unclaim an order (remove assignedManager)
export const unclaim_order = mutation({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { orderId }) => {
    const existing = await ctx.db.get(orderId);
    if (!existing) throw new Error("Order not found");
    // Remove assignedManager by replacing document without the field
    const { assignedManager, _id, _creationTime, ...rest } = existing as any;
    await ctx.db.replace(orderId, { ...rest, updatedAt: Date.now() });
    return { status: 200 };
  },
});
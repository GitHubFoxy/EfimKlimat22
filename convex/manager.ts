import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List orders for managers by status, newest first by updatedAt/_creationTime
export const list_orders_by_status = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipping"),
      v.literal("done"),
      v.literal("canceled"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { status, paginationOpts }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status_date", (q) => q.eq("status", status))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Update order status (manager/admin)
export const update_order_status = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipping"),
      v.literal("done"),
      v.literal("canceled"),
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
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipping"),
      v.literal("done"),
      v.literal("canceled"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { managerId, status, paginationOpts }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_manager", (q) => q.eq("managerId", managerId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Claim an order to a manager (set managerId)
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
      managerId: managerId,
      updatedAt: Date.now(),
    });
    return { status: 200 };
  },
});

// Unclaim an order (remove managerId)
export const unclaim_order = mutation({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { orderId }) => {
    const existing = await ctx.db.get(orderId);
    if (!existing) throw new Error("Order not found");
    // Remove managerId by replacing document without the field
    const { managerId, _id, _creationTime, ...rest } = existing as any;
    await ctx.db.replace(orderId, { ...rest, updatedAt: Date.now() });
    return { status: 200 };
  },
});

// List all items for inventory management
export const list_items = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    return await ctx.db
      .query("items")
      .filter((q) => q.neq(q.field("status"), "archived"))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Get item with brand details
export const get_item_with_brand = query({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");
    
    const brand = await ctx.db.get((item as any).brandId as any);
    if (!brand) throw new Error("Brand not found");

    return {
      _id: item._id,
      name: (item as any).name,
      sku: (item as any).sku,
      price: (item as any).price,
      quantity: (item as any).quantity,
      status: (item as any).status,
      inStock: (item as any).inStock,
      brand: {
        _id: brand._id,
        name: (brand as any).name,
      },
    };
  },
});
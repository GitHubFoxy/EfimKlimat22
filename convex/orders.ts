import { v } from "convex/values";
import { query } from "./_generated/server";

// Get order by ID for public confirmation page
export const get_order_by_id = query({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) return null;

    // Fetch order items
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", id))
      .collect();

    return {
      ...order,
      items,
    };
  },
});

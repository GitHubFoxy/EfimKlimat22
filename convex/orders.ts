import { v } from 'convex/values'
import { query } from './_generated/server'
import { verifyOrderOwnership } from './authHelpers'

// Get order by ID for public confirmation page
// Requires ownership verification: user must own the order OR order was created from their session
export const get_order_by_id = query({
  args: {
    id: v.id('orders'),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { id, sessionId }) => {
    const order = await verifyOrderOwnership(ctx, id, sessionId)

    const items = await ctx.db
      .query('orderItems')
      .withIndex('by_order', (q) => q.eq('orderId', id))
      .collect()

    return {
      ...order,
      items,
    }
  },
})
